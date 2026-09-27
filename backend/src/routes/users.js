import express from 'express';
import storage from '../config/storage.js';
import { authenticate, authorize } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
import { profileUpdateSchema, passwordChangeSchema, clampInt } from '../utils/validation.js';
import { publicUser, publicItem, publicReview } from '../utils/serializers.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (admin) or public profiles
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200: { description: List of users }
 */
router.get('/', authenticate, (req, res) => {
  const { search } = req.query;
  const page = clampInt(req.query.page, { min: 1, max: 1000, fallback: 1 });
  const limit = clampInt(req.query.limit, { min: 1, max: 50, fallback: 10 });
  const isAdmin = req.user.role === 'admin';

  let users = storage.data.users.map((user) => {
    const safe = publicUser(user);
    // Contact details are only exposed to administrators.
    return isAdmin ? { ...safe, email: user.email } : safe;
  });

  if (search) {
    const query = String(search).toLowerCase().slice(0, 60);
    users = users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.location?.toLowerCase().includes(query)
    );
  }

  const start = (page - 1) * limit;
  res.json({
    success: true,
    data: users.slice(start, start + limit),
    pagination: { total: users.length, page, limit },
  });
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID with their items
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: User profile }
 *       404: { description: Not found }
 */
router.get('/:id', (req, res) => {
  const user = storage.findById('users', req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const userItems = storage
    .find('items', (i) => i.ownerId === user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(publicItem);
  const userReviews = storage
    .find('reviews', (r) => r.revieweeId === user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(publicReview);

  // Email addresses stay private, including on your own public profile page.
  res.json({ success: true, data: { ...publicUser(user), items: userItems, reviews: userReviews } });
});

/**
 * @swagger
 * /api/users/profile/update:
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               bio: { type: string }
 *               location: { type: string }
 *               avatar: { type: string }
 *     responses:
 *       200: { description: Profile updated }
 */
router.put('/profile/update', authenticate, (req, res) => {
  const { error, value } = profileUpdateSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  const updated = storage.update('users', req.user.id, value);
  res.json({ success: true, message: 'Profile updated', data: publicUser(updated) });
});

/**
 * @swagger
 * /api/users/profile/password:
 *   put:
 *     summary: Change the current user password
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Password updated }
 *       400: { description: Current password is incorrect }
 */
router.put('/profile/password', authenticate, async (req, res) => {
  const { error, value } = passwordChangeSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  const user = storage.findById('users', req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const matches = await bcrypt.compare(value.currentPassword, user.password);
  if (!matches) {
    return res.status(400).json({ success: false, message: 'Your current password is incorrect' });
  }

  const sameAsBefore = await bcrypt.compare(value.newPassword, user.password);
  if (sameAsBefore) {
    return res.status(400).json({ success: false, message: 'Choose a password you have not used before' });
  }

  storage.update('users', user.id, { password: await bcrypt.hash(value.newPassword, 10) });
  storage.create('notifications', {
    userId: user.id,
    type: 'system',
    title: 'Password updated',
    message: 'Your BorrowBox password was changed. If this was not you, contact support immediately.',
    relatedId: user.id,
    read: false,
  });

  res.json({ success: true, message: 'Password updated successfully' });
});

/**
 * @swagger
 * /api/users/{id}/verify:
 *   put:
 *     summary: Verify a user (admin only)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: User verified }
 */
router.put('/:id/verify', authenticate, authorize('admin'), (req, res) => {
  const user = storage.findById('users', req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  const updated = storage.update('users', req.params.id, { verified: true });
  res.json({ success: true, message: 'User verified', data: publicUser(updated) });
});

export default router;
