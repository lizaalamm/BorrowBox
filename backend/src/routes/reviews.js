import express from 'express';
import storage from '../config/storage.js';
import { authenticate } from '../middleware/auth.js';
import { reviewSchema } from '../utils/validation.js';
import { publicReview } from '../utils/serializers.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Reviews & Ratings
 */

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Get reviews with filters
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: itemId
 *         schema: { type: string }
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [item, user] }
 *     responses:
 *       200: { description: Reviews list }
 */
router.get('/', (req, res) => {
  let reviews = [...storage.data.reviews];
  const { itemId, userId, type } = req.query;
  if (itemId) reviews = reviews.filter(r => r.itemId === itemId);
  if (userId) reviews = reviews.filter(r => r.revieweeId === userId || r.reviewerId === userId);
  if (type) reviews = reviews.filter(r => r.type === type);

  reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const enriched = reviews.map(publicReview);

  res.json({ success: true, data: enriched });
});

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create a review
 *     tags: [Reviews]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [itemId, rating, comment]
 *             properties:
 *               itemId: { type: string }
 *               rating: { type: integer, minimum: 1, maximum: 5, example: 5 }
 *               comment: { type: string, example: "Great experience!" }
 *               type: { type: string, enum: [item, user], default: item }
 *     responses:
 *       201: { description: Review created }
 */
router.post('/', authenticate, (req, res) => {
  const { error, value } = reviewSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  const item = storage.findById('items', value.itemId);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

  // Reviews are only open to people who actually borrowed the item.
  const borrowHistory = storage.findOne('borrowRequests', br =>
    br.itemId === value.itemId &&
    br.borrowerId === req.user.id &&
    ['returned', 'completed'].includes(br.status)
  );
  if (!borrowHistory && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'You can review this item once your borrow is complete',
    });
  }

  const existing = storage.findOne('reviews', r => r.itemId === value.itemId && r.reviewerId === req.user.id);
  if (existing) return res.status(400).json({ success: false, message: 'You already reviewed this item' });

  const review = storage.create('reviews', {
    itemId: value.itemId,
    reviewerId: req.user.id,
    revieweeId: item.ownerId,
    rating: value.rating,
    comment: value.comment,
    type: value.type
  });

  // Update item rating
  const itemReviews = storage.find('reviews', r => r.itemId === value.itemId);
  const avgRating = itemReviews.reduce((sum, r) => sum + r.rating, 0) / itemReviews.length;
  storage.update('items', value.itemId, { rating: parseFloat(avgRating.toFixed(1)), reviewCount: itemReviews.length });

  // Update user rating
  const userReviews = storage.find('reviews', r => r.revieweeId === item.ownerId);
  if (userReviews.length > 0) {
    const userAvg = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
    storage.update('users', item.ownerId, { rating: parseFloat(userAvg.toFixed(1)) });
  }

  // Notification
  storage.create('notifications', {
    userId: item.ownerId,
    type: 'new_review',
    title: 'New review received',
    message: `${req.user.name} left a ${value.rating}-star review for ${item.title}`,
    relatedId: review.id,
    read: false
  });

  res.status(201).json({ success: true, message: 'Review added', data: review });
});

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete review (owner or admin)
 *     tags: [Reviews]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 */
router.delete('/:id', authenticate, (req, res) => {
  const review = storage.findById('reviews', req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
  if (review.reviewerId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  storage.delete('reviews', req.params.id);
  res.json({ success: true, message: 'Review deleted' });
});

export default router;
