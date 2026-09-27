import express from 'express';
import storage from '../config/storage.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Item categories
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories with item counts
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { type: array, items: { $ref: '#/components/schemas/Category' } }
 */
router.get('/', (req, res) => {
  // Recalculate counts
  const cats = storage.data.categories.map(cat => ({
    ...cat,
    itemCount: storage.find('items', i => i.categoryId === cat.id || i.category === cat.name).length
  }));
  res.json({ success: true, data: cats });
});

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get category by ID with items
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Category details }
 *       404: { description: Not found }
 */
router.get('/:id', (req, res) => {
  const cat = storage.findById('categories', req.params.id) || storage.findOne('categories', c => c.slug === req.params.id);
  if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
  const items = storage.find('items', i => i.categoryId === cat.id || i.category === cat.name);
  res.json({ success: true, data: { ...cat, items, itemCount: items.length } });
});

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create new category (admin only)
 *     tags: [Categories]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, icon]
 *             properties:
 *               name: { type: string, example: "Garden" }
 *               icon: { type: string, example: "🌱" }
 *               color: { type: string, example: "#10B981" }
 *               description: { type: string }
 *     responses:
 *       201: { description: Category created }
 */
router.post('/', authenticate, authorize('admin'), (req, res) => {
  const { name, icon, color, description } = req.body;
  if (!name || !icon) return res.status(400).json({ success: false, message: 'Name and icon required' });
  const exists = storage.findOne('categories', c => c.name.toLowerCase() === name.toLowerCase());
  if (exists) return res.status(400).json({ success: false, message: 'Category already exists' });
  const category = storage.create('categories', {
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    icon,
    color: color || '#8B5CF6',
    description: description || '',
    itemCount: 0
  });
  res.status(201).json({ success: true, data: category });
});

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete category (admin)
 *     tags: [Categories]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 */
router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  const deleted = storage.delete('categories', req.params.id);
  if (!deleted) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true, message: 'Category deleted' });
});

export default router;
