import express from 'express';
import storage from '../config/storage.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Messaging between users
 */

/**
 * @swagger
 * /api/messages/conversations:
 *   get:
 *     summary: Get all conversations for current user
 *     tags: [Messages]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Conversations }
 */
router.get('/conversations', authenticate, (req, res) => {
  const userId = req.user.id;
  const userMessages = storage.find('messages', m => m.senderId === userId || m.receiverId === userId);

  const convMap = new Map();
  userMessages.forEach(m => {
    const otherId = m.senderId === userId ? m.receiverId : m.senderId;
    const key = [userId, otherId].sort().join('_') + (m.itemId ? `_${m.itemId}` : '');
    if (!convMap.has(key) || new Date(m.createdAt) > new Date(convMap.get(key).lastMessage.createdAt)) {
      const otherUser = storage.findById('users', otherId);
      const item = m.itemId ? storage.findById('items', m.itemId) : null;
      const { password, ...safeOther } = otherUser || {};
      convMap.set(key, {
        conversationId: key,
        otherUser: safeOther,
        item,
        lastMessage: m,
        unreadCount: storage.find('messages', msg => msg.receiverId === userId && msg.senderId === otherId && !msg.read).length
      });
    }
  });

  const conversations = Array.from(convMap.values()).sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));
  res.json({ success: true, data: conversations });
});

/**
 * @swagger
 * /api/messages/{conversationId}:
 *   get:
 *     summary: Get messages in a conversation
 *     tags: [Messages]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Messages }
 */
router.get('/:conversationId', authenticate, (req, res) => {
  const messages = storage.find('messages', m => m.conversationId === req.params.conversationId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  if (messages.length === 0) return res.status(404).json({ success: false, message: 'Conversation not found' });

  const isParticipant = messages.some(m => m.senderId === req.user.id || m.receiverId === req.user.id);
  if (!isParticipant) return res.status(403).json({ success: false, message: 'Not authorized' });

  // Mark as read
  messages.filter(m => m.receiverId === req.user.id && !m.read).forEach(m => {
    storage.update('messages', m.id, { read: true });
  });

  res.json({ success: true, data: messages });
});

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send a message
 *     tags: [Messages]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [receiverId, text]
 *             properties:
 *               receiverId: { type: string }
 *               text: { type: string, example: "Hi, is this still available?" }
 *               itemId: { type: string }
 *     responses:
 *       201: { description: Message sent }
 */
router.post('/', authenticate, (req, res) => {
  const { receiverId, text, itemId } = req.body;
  if (!receiverId || !text) return res.status(400).json({ success: false, message: 'receiverId and text required' });

  const receiver = storage.findById('users', receiverId);
  if (!receiver) return res.status(404).json({ success: false, message: 'Receiver not found' });
  if (receiverId === req.user.id) return res.status(400).json({ success: false, message: 'Cannot message yourself' });

  const conversationId = [req.user.id, receiverId].sort().join('_') + (itemId ? `_${itemId}` : '');

  const message = storage.create('messages', {
    conversationId,
    senderId: req.user.id,
    receiverId,
    itemId: itemId || null,
    text,
    read: false
  });

  res.status(201).json({ success: true, data: message });
});

export default router;
