import express from 'express';
import storage from '../config/storage.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard analytics & stats
 */

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get current user dashboard stats
 *     tags: [Dashboard]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: User stats }
 */
router.get('/stats', authenticate, (req, res) => {
  const userId = req.user.id;
  const myItems = storage.find('items', i => i.ownerId === userId);
  const myBorrowed = storage.find('borrowRequests', r => r.borrowerId === userId);
  const myLent = storage.find('borrowRequests', r => r.ownerId === userId);
  const wishlist = storage.find('wishlists', w => w.userId === userId);
  const notifications = storage.find('notifications', n => n.userId === userId && !n.read);

  const pendingRequests = myLent.filter(r => r.status === 'pending').length;
  const activeBorrows = myBorrowed.filter(r => ['approved', 'borrowed'].includes(r.status)).length;
  const activeLends = myLent.filter(r => ['approved', 'borrowed'].includes(r.status)).length;

  const totalEarnings = myLent
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => sum + (r.totalFee || 0), 0);

  const recentActivity = [...storage.data.borrowRequests]
    .filter(r => r.borrowerId === userId || r.ownerId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map(r => {
      const item = storage.findById('items', r.itemId);
      return { ...r, itemTitle: item?.title || 'Unknown Item' };
    });

  // Monthly stats for chart
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.toLocaleString('default', { month: 'short' });
    const monthBorrows = myBorrowed.filter(r => {
      const d = new Date(r.createdAt);
      return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
    }).length;
    const monthLends = myLent.filter(r => {
      const d = new Date(r.createdAt);
      return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
    }).length;
    monthlyData.push({ month, borrows: monthBorrows, lends: monthLends });
  }

  res.json({
    success: true,
    data: {
      overview: {
        totalItems: myItems.length,
        availableItems: myItems.filter(i => i.availability === 'available').length,
        borrowedItems: myItems.filter(i => i.availability === 'borrowed').length,
        totalBorrowed: myBorrowed.length,
        totalLent: myLent.length,
        wishlistCount: wishlist.length,
        unreadNotifications: notifications.length,
        pendingRequests,
        activeBorrows,
        activeLends,
        totalEarnings,
        rating: req.user.rating,
        verified: Boolean(req.user.verified)
      },
      recentActivity,
      monthlyData,
      topItems: myItems.sort((a, b) => b.borrowCount - a.borrowCount).slice(0, 3)
    }
  });
});

/**
 * @swagger
 * /api/dashboard/admin:
 *   get:
 *     summary: Admin dashboard stats
 *     tags: [Dashboard]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Admin stats }
 */
router.get('/admin', authenticate, authorize('admin'), (req, res) => {
  const totalUsers = storage.data.users.length;
  const totalItems = storage.data.items.length;
  const totalRequests = storage.data.borrowRequests.length;
  const totalReviews = storage.data.reviews.length;

  const itemsByCategory = storage.data.categories.map(cat => ({
    name: cat.name,
    count: storage.find('items', i => i.categoryId === cat.id || i.category === cat.name).length,
    color: cat.color
  }));

  const requestsByStatus = ['pending', 'approved', 'borrowed', 'completed', 'rejected', 'cancelled'].map(status => ({
    status,
    count: storage.find('borrowRequests', r => r.status === status).length
  }));

  const recentUsers = [...storage.data.users]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map(u => {
      const { password, ...safe } = u;
      return safe;
    });

  const recentItems = [...storage.data.items]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const monthlyGrowth = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.toLocaleString('default', { month: 'short' });
    const users = storage.data.users.filter(u => {
      const d = new Date(u.createdAt);
      return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
    }).length;
    const items = storage.data.items.filter(it => {
      const d = new Date(it.createdAt);
      return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
    }).length;
    monthlyGrowth.push({ month, users, items });
  }

  res.json({
    success: true,
    data: {
      totals: { totalUsers, totalItems, totalRequests, totalReviews },
      itemsByCategory,
      requestsByStatus,
      recentUsers,
      recentItems,
      monthlyGrowth,
      avgRating: (storage.data.users.reduce((sum, u) => sum + (u.rating || 0), 0) / totalUsers).toFixed(1)
    }
  });
});

export default router;
