import express from 'express';
import storage from '../config/storage.js';
import { authenticate } from '../middleware/auth.js';
import { itemSchema } from '../utils/validation.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Items
 *   description: Item management - core of BorrowBox
 */

function enrichItem(item) {
  const owner = storage.findById('users', item.ownerId);
  const category = storage.findById('categories', item.categoryId) || storage.findOne('categories', c => c.name === item.category);
  const { password, ...safeOwner } = owner || {};
  return {
    ...item,
    owner: safeOwner || null,
    categoryDetails: category || null
  };
}

/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: Get all items with filters, search, pagination
 *     tags: [Items]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search in title, description, tags
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: condition
 *         schema: { type: string, enum: [New, Like New, Good, Fair] }
 *       - in: query
 *         name: availability
 *         schema: { type: string, enum: [available, borrowed, reserved, unavailable] }
 *       - in: query
 *         name: minValue
 *         schema: { type: number }
 *       - in: query
 *         name: maxValue
 *         schema: { type: number }
 *       - in: query
 *         name: ownerId
 *         schema: { type: string }
 *       - in: query
 *         name: featured
 *         schema: { type: boolean }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [newest, popular, rating, valueLow, valueHigh] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 12 }
 *     responses:
 *       200:
 *         description: Paginated items
 */
router.get('/', (req, res) => {
  let items = [...storage.data.items];
  const {
    search, category, condition, availability, minValue, maxValue,
    ownerId, featured, sortBy = 'newest', page = 1, limit = 12
  } = req.query;

  if (search) {
    const q = search.toLowerCase();
    items = items.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      i.tags?.some(t => t.toLowerCase().includes(q)) ||
      i.category.toLowerCase().includes(q)
    );
  }
  if (category) {
    items = items.filter(i =>
      i.category.toLowerCase() === category.toLowerCase() ||
      i.categoryId === category ||
      storage.findOne('categories', c => c.slug === category.toLowerCase())?.id === i.categoryId
    );
  }
  if (condition) items = items.filter(i => i.condition === condition);
  if (availability) items = items.filter(i => i.availability === availability);
  if (minValue) items = items.filter(i => i.value >= parseFloat(minValue));
  if (maxValue) items = items.filter(i => i.value <= parseFloat(maxValue));
  if (ownerId) items = items.filter(i => i.ownerId === ownerId);
  if (featured !== undefined) items = items.filter(i => i.featured === (featured === 'true' || featured === true));

  // Sorting
  switch (sortBy) {
    case 'popular': items.sort((a, b) => b.borrowCount - a.borrowCount); break;
    case 'rating': items.sort((a, b) => b.rating - a.rating); break;
    case 'valueLow': items.sort((a, b) => a.value - b.value); break;
    case 'valueHigh': items.sort((a, b) => b.value - a.value); break;
    case 'newest':
    default: items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
  }

  const total = items.length;
  const start = (parseInt(page) - 1) * parseInt(limit);
  const paginated = items.slice(start, start + parseInt(limit)).map(enrichItem);

  res.json({
    success: true,
    data: paginated,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

/**
 * @swagger
 * /api/items/featured:
 *   get:
 *     summary: Get featured items
 *     tags: [Items]
 *     responses:
 *       200: { description: Featured items }
 */
router.get('/featured', (req, res) => {
  const featured = storage.find('items', i => i.featured).map(enrichItem);
  res.json({ success: true, data: featured });
});

/**
 * @swagger
 * /api/items/my-items:
 *   get:
 *     summary: Get current user's items
 *     tags: [Items]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: User items }
 */
router.get('/my-items', authenticate, (req, res) => {
  const items = storage.find('items', i => i.ownerId === req.user.id).map(enrichItem);
  res.json({ success: true, data: items });
});

/**
 * @swagger
 * /api/items/{id}:
 *   get:
 *     summary: Get single item by ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Item details }
 *       404: { description: Not found }
 */
router.get('/:id', (req, res) => {
  const item = storage.findById('items', req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
  const enriched = enrichItem(item);
  const reviews = storage.find('reviews', r => r.itemId === item.id);
  const related = storage.find('items', i => i.categoryId === item.categoryId && i.id !== item.id).slice(0, 4).map(enrichItem);
  res.json({ success: true, data: { ...enriched, reviews, relatedItems: related } });
});

/**
 * @swagger
 * /api/items:
 *   post:
 *     summary: Create new item listing
 *     tags: [Items]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, category, condition, value, location]
 *             properties:
 *               title: { type: string, example: "DeWalt Drill" }
 *               description: { type: string, example: "Powerful drill..." }
 *               category: { type: string, example: "Tools" }
 *               categoryId: { type: string }
 *               condition: { type: string, enum: [New, Like New, Good, Fair] }
 *               value: { type: number, example: 199 }
 *               lendingFee: { type: number, example: 0 }
 *               location: { type: string, example: "San Francisco" }
 *               tags: { type: array, items: { type: string } }
 *               images: { type: array, items: { type: string } }
 *     responses:
 *       201: { description: Item created }
 *       400: { description: Validation error }
 */
router.post('/', authenticate, (req, res) => {
  const { error, value } = itemSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  let categoryId = value.categoryId;
  let categoryName = value.category;
  if (!categoryId) {
    const cat = storage.findOne('categories', c => c.name.toLowerCase() === value.category.toLowerCase() || c.slug === value.category.toLowerCase());
    if (cat) {
      categoryId = cat.id;
      categoryName = cat.name;
    } else {
      // create uncategorized? use first
      categoryId = storage.data.categories[0]?.id;
      categoryName = storage.data.categories[0]?.name || value.category;
    }
  } else {
    const cat = storage.findById('categories', categoryId);
    if (cat) categoryName = cat.name;
  }

  const item = storage.create('items', {
    title: value.title,
    description: value.description,
    category: categoryName,
    categoryId,
    condition: value.condition,
    value: value.value,
    lendingFee: value.lendingFee || 0,
    location: value.location,
    tags: value.tags || [],
    images: value.images && value.images.length ? value.images : ['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800'],
    ownerId: req.user.id,
    availability: 'available',
    rating: 5.0,
    reviewCount: 0,
    borrowCount: 0,
    featured: false
  });

  // Update user stats
  const user = storage.findById('users', req.user.id);
  if (user) storage.update('users', req.user.id, { totalLends: (user.totalLends || 0) + 0 });

  res.status(201).json({ success: true, message: 'Item listed successfully', data: enrichItem(item) });
});

/**
 * @swagger
 * /api/items/{id}:
 *   put:
 *     summary: Update item (owner only)
 *     tags: [Items]
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
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               condition: { type: string }
 *               value: { type: number }
 *               lendingFee: { type: number }
 *               availability: { type: string, enum: [available, borrowed, reserved, unavailable] }
 *               location: { type: string }
 *     responses:
 *       200: { description: Updated }
 *       403: { description: Not owner }
 */
router.put('/:id', authenticate, (req, res) => {
  const item = storage.findById('items', req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
  if (item.ownerId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to update this item' });
  }
  const allowed = ['title', 'description', 'condition', 'value', 'lendingFee', 'availability', 'location', 'tags', 'images', 'featured', 'category', 'categoryId'];
  const updates = {};
  allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  const updated = storage.update('items', req.params.id, updates);
  res.json({ success: true, message: 'Item updated', data: enrichItem(updated) });
});

/**
 * @swagger
 * /api/items/{id}:
 *   delete:
 *     summary: Delete item (owner or admin)
 *     tags: [Items]
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
  const item = storage.findById('items', req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
  if (item.ownerId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  // Check active borrow requests
  const active = storage.find('borrowRequests', br => br.itemId === item.id && ['pending', 'approved', 'borrowed'].includes(br.status));
  if (active.length > 0) {
    return res.status(400).json({ success: false, message: 'Cannot delete item with active borrow requests' });
  }
  storage.delete('items', req.params.id);
  res.json({ success: true, message: 'Item deleted' });
});

export default router;
