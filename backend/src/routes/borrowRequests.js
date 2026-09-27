import express from 'express';
import storage from '../config/storage.js';
import { authenticate } from '../middleware/auth.js';
import { borrowRequestSchema, borrowStatusSchema } from '../utils/validation.js';
import { publicBorrowRequest } from '../utils/serializers.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: BorrowRequests
 *   description: Borrow request workflow
 */

const enrichRequest = publicBorrowRequest;

/**
 * @swagger
 * /api/borrow-requests:
 *   get:
 *     summary: Get borrow requests (filtered by role)
 *     tags: [BorrowRequests]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [borrowed, lent, all] }
 *         description: borrowed = I am borrower, lent = I am owner
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, approved, rejected, borrowed, returned, completed, cancelled, overdue] }
 *     responses:
 *       200: { description: List of requests }
 */
router.get('/', authenticate, (req, res) => {
  const { type = 'all', status } = req.query;
  let requests = [...storage.data.borrowRequests];

  if (type === 'borrowed') {
    requests = requests.filter(r => r.borrowerId === req.user.id);
  } else if (type === 'lent') {
    requests = requests.filter(r => r.ownerId === req.user.id);
  } else {
    // all where user is involved or admin sees all
    if (req.user.role !== 'admin') {
      requests = requests.filter(r => r.borrowerId === req.user.id || r.ownerId === req.user.id);
    }
  }

  if (status) requests = requests.filter(r => r.status === status);

  requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, data: requests.map(enrichRequest) });
});

/**
 * @swagger
 * /api/borrow-requests/{id}:
 *   get:
 *     summary: Get single borrow request
 *     tags: [BorrowRequests]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Request details }
 */
router.get('/:id', authenticate, (req, res) => {
  const br = storage.findById('borrowRequests', req.params.id);
  if (!br) return res.status(404).json({ success: false, message: 'Request not found' });
  if (br.borrowerId !== req.user.id && br.ownerId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  res.json({ success: true, data: enrichRequest(br) });
});

/**
 * @swagger
 * /api/borrow-requests:
 *   post:
 *     summary: Create borrow request
 *     tags: [BorrowRequests]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [itemId, startDate, endDate]
 *             properties:
 *               itemId: { type: string }
 *               startDate: { type: string, format: date, example: "2024-02-01" }
 *               endDate: { type: string, format: date, example: "2024-02-05" }
 *               message: { type: string, example: "Need for weekend project" }
 *     responses:
 *       201: { description: Request created }
 */
router.post('/', authenticate, (req, res) => {
  const { error, value } = borrowRequestSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  const start = new Date(value.startDate);
  const end = new Date(value.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return res.status(400).json({ success: false, message: 'Invalid borrow dates' });
  }
  if (end < start) {
    return res.status(400).json({ success: false, message: 'The return date must be on or after the start date' });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (start < today && req.user.role !== 'admin') {
    return res.status(400).json({ success: false, message: 'The start date cannot be in the past' });
  }

  const item = storage.findById('items', value.itemId);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
  if (item.ownerId === req.user.id) return res.status(400).json({ success: false, message: 'Cannot borrow your own item' });
  if (item.availability !== 'available') return res.status(400).json({ success: false, message: `Item is ${item.availability}, not available` });

  const existingPending = storage.findOne('borrowRequests', r => r.itemId === value.itemId && r.borrowerId === req.user.id && r.status === 'pending');
  if (existingPending) return res.status(400).json({ success: false, message: 'You already have a pending request for this item' });

  const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  const totalFee = (item.lendingFee || 0) * days;

  const br = storage.create('borrowRequests', {
    itemId: value.itemId,
    borrowerId: req.user.id,
    ownerId: item.ownerId,
    status: 'pending',
    startDate: value.startDate,
    endDate: value.endDate,
    message: value.message || '',
    totalFee,
    ownerMessage: ''
  });

  // Create notification for owner
  storage.create('notifications', {
    userId: item.ownerId,
    type: 'borrow_request',
    title: 'New borrow request',
    message: `${req.user.name} wants to borrow your ${item.title}`,
    relatedId: br.id,
    read: false
  });

  res.status(201).json({ success: true, message: 'Borrow request sent', data: enrichRequest(br) });
});

/**
 * @swagger
 * /api/borrow-requests/{id}/status:
 *   put:
 *     summary: Update borrow request status (approve, reject, etc.)
 *     tags: [BorrowRequests]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [approved, rejected, borrowed, returned, completed, cancelled] }
 *               ownerMessage: { type: string }
 *     responses:
 *       200: { description: Status updated }
 */
router.put('/:id/status', authenticate, (req, res) => {
  const { error, value } = borrowStatusSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });
  const { status, ownerMessage } = value;
  const validTransitions = {
    pending: ['approved', 'rejected', 'cancelled'],
    approved: ['borrowed', 'cancelled'],
    borrowed: ['returned', 'overdue'],
    returned: ['completed'],
    overdue: ['returned', 'completed']
  };

  const br = storage.findById('borrowRequests', req.params.id);
  if (!br) return res.status(404).json({ success: false, message: 'Request not found' });

  const isOwner = br.ownerId === req.user.id;
  const isBorrower = br.borrowerId === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isBorrower && !isAdmin) return res.status(403).json({ success: false, message: 'Not authorized' });

  // Permission checks
  if (['approved', 'rejected'].includes(status) && !isOwner && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Only owner can approve/reject' });
  }
  if (['borrowed'].includes(status) && !isOwner && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Only owner can mark as borrowed' });
  }
  if (['returned'].includes(status) && !isBorrower && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Only borrower can mark as returned' });
  }
  if (['completed'].includes(status) && !isOwner && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Only owner can complete' });
  }
  if (status === 'cancelled' && !isBorrower && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Only borrower can cancel' });
  }

  if (!validTransitions[br.status] || !validTransitions[br.status].includes(status)) {
    return res.status(400).json({ success: false, message: `Cannot transition from ${br.status} to ${status}` });
  }

  const updates = { status };
  if (ownerMessage) updates.ownerMessage = ownerMessage;

  const updated = storage.update('borrowRequests', req.params.id, updates);

  // Update item availability based on status
  const item = storage.findById('items', br.itemId);
  if (item) {
    if (status === 'borrowed') {
      storage.update('items', item.id, { availability: 'borrowed', borrowCount: (item.borrowCount || 0) + 1 });
    } else if (status === 'completed' || status === 'cancelled' || status === 'rejected') {
      storage.update('items', item.id, { availability: 'available' });
    } else if (status === 'approved') {
      storage.update('items', item.id, { availability: 'reserved' });
    }
  }

  // Notifications
  let notifUserId, notifTitle, notifMessage, notifType;
  if (status === 'approved') {
    notifUserId = br.borrowerId;
    notifType = 'request_approved';
    notifTitle = 'Request approved';
    notifMessage = `Your request for ${item?.title} was approved by owner`;
  } else if (status === 'rejected') {
    notifUserId = br.borrowerId;
    notifType = 'request_rejected';
    notifTitle = 'Request declined';
    notifMessage = `Your request for ${item?.title} was declined`;
  } else if (status === 'borrowed') {
    notifUserId = br.borrowerId;
    notifType = 'system';
    notifTitle = 'Item borrowed';
    notifMessage = `You have borrowed ${item?.title}. Return it by ${br.endDate}.`;
  } else if (status === 'returned') {
    notifUserId = br.ownerId;
    notifType = 'item_returned';
    notifTitle = 'Item returned';
    notifMessage = `${storage.findById('users', br.borrowerId)?.name} returned ${item?.title}`;
  } else if (status === 'completed') {
    notifUserId = br.borrowerId;
    notifType = 'system';
    notifTitle = 'Borrow completed';
    notifMessage = `Borrowing of ${item?.title} is complete. You can now leave a review.`;
  } else if (status === 'cancelled') {
    notifUserId = br.ownerId;
    notifType = 'system';
    notifTitle = 'Request cancelled';
    notifMessage = `${storage.findById('users', br.borrowerId)?.name} cancelled their request for ${item?.title}`;
  }

  if (notifUserId) {
    storage.create('notifications', {
      userId: notifUserId,
      type: notifType,
      title: notifTitle,
      message: notifMessage,
      relatedId: br.id,
      read: false
    });
  }

  res.json({ success: true, message: `Request ${status}`, data: enrichRequest(updated) });
});

/**
 * @swagger
 * /api/borrow-requests/{id}:
 *   delete:
 *     summary: Delete borrow request (admin or if cancelled/rejected)
 *     tags: [BorrowRequests]
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
  const br = storage.findById('borrowRequests', req.params.id);
  if (!br) return res.status(404).json({ success: false, message: 'Not found' });
  if (br.borrowerId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  if (!['cancelled', 'rejected', 'completed'].includes(br.status) && req.user.role !== 'admin') {
    return res.status(400).json({ success: false, message: 'Can only delete cancelled/rejected/completed requests' });
  }
  storage.delete('borrowRequests', req.params.id);
  res.json({ success: true, message: 'Request deleted' });
});

export default router;
