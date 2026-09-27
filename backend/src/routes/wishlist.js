import express from 'express';
import storage from '../config/storage.js';
import { authenticate } from '../middleware/auth.js';
import { publicUser } from '../utils/serializers.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: Wishlist / Favorites
 */

function enrichWishlist(w) {
  const item = storage.findById('items', w.itemId);
  if (!item) return null;
  return { ...w, item: { ...item, owner: publicUser(storage.findById('users', item.ownerId)) } };
}

/**
 * @swagger
 * /api/wishlist:
 *   get:
 *     summary: Get user's wishlist
 *     tags: [Wishlist]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Wishlist items }
 */
router.get('/', authenticate, (req, res) => {
  const wishlist = storage.find('wishlists', w => w.userId === req.user.id)
    .map(enrichWishlist)
    .filter(Boolean);
  res.json({ success: true, data: wishlist });
});

/**
 * @swagger
 * /api/wishlist/{itemId}:
 *   post:
 *     summary: Add item to wishlist
 *     tags: [Wishlist]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201: { description: Added to wishlist }
 */
router.post('/:itemId', authenticate, (req, res) => {
  const item = storage.findById('items', req.params.itemId);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
  const exists = storage.findOne('wishlists', w => w.userId === req.user.id && w.itemId === req.params.itemId);
  if (exists) return res.status(400).json({ success: false, message: 'Already in wishlist' });
  const wish = storage.create('wishlists', { userId: req.user.id, itemId: req.params.itemId });
  res.status(201).json({ success: true, message: 'Added to wishlist', data: enrichWishlist(wish) });
});

/**
 * @swagger
 * /api/wishlist/{itemId}:
 *   delete:
 *     summary: Remove item from wishlist
 *     tags: [Wishlist]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Removed }
 */
router.delete('/:itemId', authenticate, (req, res) => {
  const wish = storage.findOne('wishlists', w => w.userId === req.user.id && w.itemId === req.params.itemId);
  if (!wish) return res.status(404).json({ success: false, message: 'Not in wishlist' });
  storage.delete('wishlists', wish.id);
  res.json({ success: true, message: 'Removed from wishlist' });
});

/**
 * @swagger
 * /api/wishlist/check/{itemId}:
 *   get:
 *     summary: Check if item is in wishlist
 *     tags: [Wishlist]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Check result }
 */
router.get('/check/:itemId', authenticate, (req, res) => {
  const exists = !!storage.findOne('wishlists', w => w.userId === req.user.id && w.itemId === req.params.itemId);
  res.json({ success: true, data: { inWishlist: exists } });
});

export default router;
