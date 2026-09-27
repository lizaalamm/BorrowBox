import express from 'express';
import storage from '../config/storage.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { profileUpdateSchema, clampInt } from '../utils/validation.js';

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
    const { password, email, ...safe } = user;
    // Contact details are only exposed to administrators.
    return isAdmin ? { ...safe, email } : safe;
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
  const { password, ...rest } = user;
  const safeUser = req.user?.role === 'admin' ? rest : (({ email, ...publicFields }) => publicFields)(rest);
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
  const { error, value } = profileUpdateSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  const updated = storage.update('users', req.user.id, value);
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
