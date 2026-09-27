/**
 * API contract and security tests.
 *
 * Runs against an in-process server with a throwaway JSON database, so it is
 * safe to run at any time:  npm test
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import { after, before, describe, test } from 'node:test';

process.env.NODE_ENV = process.env.NODE_ENV === 'production' ? 'production' : 'test';
process.env.DB_PATH = path.join(os.tmpdir(), `borrowbox-test-${process.pid}.json`);

const { default: app } = await import('../src/app.js');
const { default: storage } = await import('../src/config/storage.js');

let server;
let baseUrl;

/** Small fetch wrapper returning the status code and parsed body. */
async function request(pathname, { method = 'GET', token, body } = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  return { status: response.status, body: json, headers: response.headers };
}

async function signIn(email, password) {
  const { status, body } = await request('/api/auth/login', { method: 'POST', body: { email, password } });
  assert.equal(status, 200, `login should succeed for ${email}`);
  return { token: body.data.token, user: body.data.user };
}

before(async () => {
  await storage.ready;
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server?.close();
  fs.rmSync(process.env.DB_PATH, { force: true });
});

describe('health and public catalogue', () => {
  test('health endpoint reports ok', async () => {
    const { status, body } = await request('/api/health');
    assert.equal(status, 200);
    assert.equal(body.status, 'ok');
  });

  test('categories expose icon keys and item counts', async () => {
    const { status, body } = await request('/api/categories');
    assert.equal(status, 200);
    assert.equal(body.data.length, 8);
    for (const category of body.data) {
      assert.match(category.icon, /^[a-z-]+$/, 'icon keys must not contain glyphs');
      assert.equal(typeof category.itemCount, 'number');
    }
  });

  test('items never expose credentials or contact details', async () => {
    const { status, body } = await request('/api/items/featured');
    assert.equal(status, 200);
    assert.ok(body.data.length > 0);
    for (const item of body.data) {
      assert.ok(!('password' in item.owner));
      assert.ok(!('email' in item.owner));
    }
  });

  test('unknown routes return a 404 envelope', async () => {
    const { status, body } = await request('/api/does-not-exist');
    assert.equal(status, 404);
    assert.equal(body.success, false);
  });
});

describe('authentication', () => {
  test('demo accounts sign in and receive a token', async () => {
    const { token, user } = await signIn('user2@borrowbox.com', 'Demo@123');
    assert.ok(token.length > 50);
    assert.equal(user.email, 'user2@borrowbox.com');
    assert.ok(!('password' in user));
  });

  test('wrong credentials are rejected', async () => {
    const { status } = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'user2@borrowbox.com', password: 'not-the-password' },
    });
    assert.equal(status, 401);
  });

  test('registration enforces the password policy', async () => {
    const weak = await request('/api/auth/register', {
      method: 'POST',
      body: { name: 'Test Person', email: 'test.person@example.com', password: 'password' },
    });
    assert.equal(weak.status, 400);

    const valid = await request('/api/auth/register', {
      method: 'POST',
      body: { name: 'Test Person', email: 'test.person@example.com', password: 'Str0ngPass1' },
    });
    assert.equal(valid.status, 201);
    assert.ok(!('password' in valid.body.data.user));
  });

  test('protected routes reject missing and malformed tokens', async () => {
    assert.equal((await request('/api/items/my-items')).status, 401);
    assert.equal((await request('/api/auth/me', { token: 'not.a.token' })).status, 401);
  });
});

describe('listings', () => {
  test('a listing requires a known category and sanitises markup', async () => {
    const { token } = await signIn('user2@borrowbox.com', 'Demo@123');
    const { body: categories } = await request('/api/categories');
    const categoryId = categories.data[0].id;

    const missingCategory = await request('/api/items', {
      method: 'POST',
      token,
      body: {
        title: 'Orbital Sander',
        description: 'Random orbit sander with assorted discs for cabinetry work.',
        condition: 'Good',
        value: 120,
        location: 'Mission District, SF',
      },
    });
    assert.equal(missingCategory.status, 400);

    const created = await request('/api/items', {
      method: 'POST',
      token,
      body: {
        title: '<script>alert(1)</script> Orbital Sander',
        description: 'Random orbit sander with assorted discs for cabinetry work.',
        condition: 'Good',
        value: 120,
        location: 'Mission District, SF',
        categoryId,
      },
    });
    assert.equal(created.status, 201);
    assert.ok(!created.body.data.title.includes('<script>'));

    const unknownField = await request(`/api/items/${created.body.data.id}`, {
      method: 'PUT',
      token,
      body: { featured: true },
    });
    assert.equal(unknownField.status, 400);

    const otherUser = await signIn('user3@borrowbox.com', 'User@123');
    const stolenEdit = await request(`/api/items/${created.body.data.id}`, {
      method: 'PUT',
      token: otherUser.token,
      body: { title: 'Not mine to change' },
    });
    assert.equal(stolenEdit.status, 403);

    const removed = await request(`/api/items/${created.body.data.id}`, { method: 'DELETE', token });
    assert.equal(removed.status, 200);
  });

  test('the wishlist prevents duplicates and cleans up', async () => {
    const { token } = await signIn('user2@borrowbox.com', 'Demo@123');
    const { body: items } = await request('/api/items?limit=1');
    const itemId = items.data[0].id;

    assert.equal((await request(`/api/wishlist/${itemId}`, { method: 'POST', token })).status, 201);
    assert.equal((await request(`/api/wishlist/${itemId}`, { method: 'POST', token })).status, 400);
    assert.equal((await request(`/api/wishlist/${itemId}`, { method: 'DELETE', token })).status, 200);
    assert.equal((await request(`/api/wishlist/${itemId}`, { method: 'DELETE', token })).status, 404);
  });
});

describe('borrow workflow', () => {
  test('only the owner can approve and only the borrower can cancel', async () => {
    const owner = await signIn('user2@borrowbox.com', 'Demo@123');
    const borrower = await signIn('user3@borrowbox.com', 'User@123');
    const { body: categories } = await request('/api/categories');

    const { body: created } = await request('/api/items', {
      method: 'POST',
      token: owner.token,
      body: {
        title: 'Tile Cutter 600mm',
        description: 'Manual tile cutter for large format tiles, includes spare scoring wheel.',
        condition: 'Good',
        value: 210,
        lendingFee: 6,
        location: 'Mission District, SF',
        categoryId: categories.data[0].id,
      },
    });

    const startDate = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
    const endDate = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);

    const badDates = await request('/api/borrow-requests', {
      method: 'POST',
      token: borrower.token,
      body: { itemId: created.data.id, startDate: endDate, endDate: startDate },
    });
    assert.equal(badDates.status, 400);

    const request200 = await request('/api/borrow-requests', {
      method: 'POST',
      token: borrower.token,
      body: { itemId: created.data.id, startDate, endDate, message: 'Bathroom refit this weekend.' },
    });
    assert.equal(request200.status, 201);
    const requestId = request200.body.data.id;
    assert.equal(request200.body.data.totalFee, 12, 'fee is the daily rate times the days');

    const selfApprove = await request(`/api/borrow-requests/${requestId}/status`, {
      method: 'PUT',
      token: borrower.token,
      body: { status: 'approved' },
    });
    assert.equal(selfApprove.status, 403);

    const approved = await request(`/api/borrow-requests/${requestId}/status`, {
      method: 'PUT',
      token: owner.token,
      body: { status: 'approved' },
    });
    assert.equal(approved.status, 200);
    assert.equal(approved.body.data.status, 'approved');

    const itemOnHold = await request(`/api/borrow-requests/${requestId}`, { token: owner.token });
    assert.equal(itemOnHold.body.data.status, 'approved');

    const cancelled = await request(`/api/borrow-requests/${requestId}/status`, {
      method: 'PUT',
      token: borrower.token,
      body: { status: 'cancelled' },
    });
    assert.equal(cancelled.status, 200);

    const deleted = await request(`/api/items/${created.data.id}`, { method: 'DELETE', token: owner.token });
    assert.equal(deleted.status, 200, 'cancelled requests no longer block deletion');
  });

  test('reviews require a completed borrow', async () => {
    const { token } = await signIn('user2@borrowbox.com', 'Demo@123');
    const { body: items } = await request('/api/items?limit=1');

    const review = await request('/api/reviews', {
      method: 'POST',
      token,
      body: { itemId: items.data[0].id, rating: 5, comment: 'Lovely item, spotless condition.' },
    });
    assert.equal(review.status, 403);
  });
});

describe('accounts and privacy', () => {
  test('public profiles hide email addresses', async () => {
    const { token } = await signIn('user2@borrowbox.com', 'Demo@123');
    const { body: users } = await request('/api/users?limit=1', { token });
    const { status, body } = await request(`/api/users/${users.data[0].id}`, { token });
    assert.equal(status, 200);
    assert.ok(!('email' in body.data));
    assert.ok(!('password' in body.data));
  });

  test('role restricted routes reject members', async () => {
    const member = await signIn('user2@borrowbox.com', 'Demo@123');
    const admin = await signIn('user1@borrowbox.com', 'Admin@123');

    assert.equal((await request('/api/dashboard/admin', { token: member.token })).status, 403);
    assert.equal((await request('/api/dashboard/admin', { token: admin.token })).status, 200);
  });

  test('passwords can be changed and restored', async () => {
    const { token } = await signIn('user2@borrowbox.com', 'Demo@123');

    const wrong = await request('/api/users/profile/password', {
      method: 'PUT',
      token,
      body: { currentPassword: 'WrongPass1', newPassword: 'Rotated@123' },
    });
    assert.equal(wrong.status, 400);

    const changed = await request('/api/users/profile/password', {
      method: 'PUT',
      token,
      body: { currentPassword: 'Demo@123', newPassword: 'Rotated@123' },
    });
    assert.equal(changed.status, 200);

    const relogin = await signIn('user2@borrowbox.com', 'Rotated@123');
    const restored = await request('/api/users/profile/password', {
      method: 'PUT',
      token: relogin.token,
      body: { currentPassword: 'Rotated@123', newPassword: 'Demo@123' },
    });
    assert.equal(restored.status, 200);
  });
});

describe('messaging', () => {
  test('members can message each other and threads stay private', async () => {
    const sender = await signIn('user2@borrowbox.com', 'Demo@123');
    const recipient = await signIn('user4@borrowbox.com', 'User@123');
    const outsider = await signIn('user3@borrowbox.com', 'User@123');

    const sent = await request('/api/messages', {
      method: 'POST',
      token: sender.token,
      body: { receiverId: recipient.user.id, text: 'Are you free to hand over the tent on Friday?' },
    });
    assert.equal(sent.status, 201);

    const conversationId = sent.body.data.conversationId;
    assert.equal((await request(`/api/messages/${conversationId}`, { token: recipient.token })).status, 200);
    assert.equal((await request(`/api/messages/${conversationId}`, { token: outsider.token })).status, 403);

    const conversations = await request('/api/messages/conversations', { token: recipient.token });
    assert.equal(conversations.status, 200);
    assert.ok(conversations.body.data.some((entry) => entry.conversationId === conversationId));
  });
});

describe('security headers', () => {
  test('responses set hardening headers and hide the framework', async () => {
    const { headers } = await request('/api/health');
    assert.equal(headers.get('x-powered-by'), null);
    assert.equal(headers.get('x-content-type-options'), 'nosniff');
    assert.ok(headers.get('content-security-policy'));
  });
});
