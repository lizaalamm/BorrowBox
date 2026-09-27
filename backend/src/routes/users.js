import express from 'express';
import storage from '../config/storage.js';
import { authenticate, authorize } from '../middleware/auth.js';

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
router.get('/', (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;
  let users = storage.data.users.map(u => {
    const { password, ...safe } = u;
    return safe;
  });

  if (search) {
    const q = search.toLowerCase();
    users = users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.location?.toLowerCase().includes(q));
  }

  const start = (page - 1) * limit;
  const paginated = users.slice(start, start + parseInt(limit));

  res.json({ success: true, data: paginated, pagination: { total: users.length, page: parseInt(page), limit: parseInt(limit) } });
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
  const { password, ...safeUser } = user;
  const userItems = storage.find('items', i => i.ownerId === user.id);
  const userReviews = storage.find('reviews', r => r.revieweeId === user.id);
  res.json({ success: true, data: { ...safeUser, items: userItems, reviews: userReviews } });
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
  const allowed = ['name', 'bio', 'location', 'avatar'];
  const updates = {};
  allowed.forEach(field => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });
  const updated = storage.update('users', req.user.id, updates);
  const { password, ...safe } = updated;
  res.json({ success: true, message: 'Profile updated', data: safe });
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
  const { password, ...safe } = updated;
  res.json({ success: true, message: 'User verified', data: safe });
});

export default router;
