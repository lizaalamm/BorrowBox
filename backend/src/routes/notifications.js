import express from 'express';
import storage from '../config/storage.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User notifications
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get current user notifications
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: unreadOnly
 *         schema: { type: boolean }
 *     responses:
 *       200: { description: Notifications }
 */
router.get('/', authenticate, (req, res) => {
  const { unreadOnly } = req.query;
  let notifs = storage.find('notifications', n => n.userId === req.user.id);
  if (unreadOnly === 'true') notifs = notifs.filter(n => !n.read);
  notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, data: notifs, unreadCount: notifs.filter(n => !n.read).length });
});

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Marked as read }
 */
router.put('/:id/read', authenticate, (req, res) => {
  const notif = storage.findById('notifications', req.params.id);
  if (!notif) return res.status(404).json({ success: false, message: 'Not found' });
  if (notif.userId !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
  const updated = storage.update('notifications', req.params.id, { read: true });
  res.json({ success: true, data: updated });
});

/**
 * @swagger
 * /api/notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: All marked as read }
 */
router.put('/read-all', authenticate, (req, res) => {
  const notifs = storage.find('notifications', n => n.userId === req.user.id && !n.read);
  notifs.forEach(n => storage.update('notifications', n.id, { read: true }));
  res.json({ success: true, message: `${notifs.length} notifications marked as read` });
});

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete notification
 *     tags: [Notifications]
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
  const notif = storage.findById('notifications', req.params.id);
  if (!notif) return res.status(404).json({ success: false, message: 'Not found' });
  if (notif.userId !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
  storage.delete('notifications', req.params.id);
  res.json({ success: true, message: 'Notification deleted' });
});

export default router;
