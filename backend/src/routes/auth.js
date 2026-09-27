import express from 'express';
import bcrypt from 'bcryptjs';
import storage from '../config/storage.js';
import { registerSchema, loginSchema } from '../utils/validation.js';
import { generateToken, authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication & Authorization
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: "John Doe" }
 *               email: { type: string, format: email, example: "john@example.com" }
 *               password: { type: string, example: "Password@123" }
 *               location: { type: string, example: "San Francisco, CA" }
 *               bio: { type: string, example: "DIY enthusiast" }
 *     responses:
 *       201: { description: User registered }
 *       400: { description: Validation error or user exists }
 */
router.post('/register', async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  const existing = storage.findOne('users', u => u.email.toLowerCase() === value.email.toLowerCase());
  if (existing) return res.status(400).json({ success: false, message: 'User already exists with this email' });

  const hashed = await bcrypt.hash(value.password, 10);
  const user = storage.create('users', {
    name: value.name,
    email: value.email.toLowerCase(),
    password: hashed,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(value.name)}`,
    role: 'user',
    bio: value.bio || '',
    location: value.location || '',
    rating: 5.0,
    totalLends: 0,
    totalBorrows: 0,
    verified: false,
    joinedAt: new Date().toISOString()
  });

  const token = generateToken(user);
  const { password, ...safeUser } = user;
  res.status(201).json({ success: true, message: 'User registered successfully', data: { user: safeUser, token } });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "demo@borrowbox.com" }
 *               password: { type: string, example: "Demo@123" }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 */
router.post('/login', async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  const user = storage.findOne('users', u => u.email.toLowerCase() === value.email.toLowerCase());
  if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(value.password, user.password);
  if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const token = generateToken(user);
  const { password, ...safeUser } = user;
  res.json({ success: true, message: 'Login successful', data: { user: safeUser, token } });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Current user }
 */
router.get('/me', authenticate, (req, res) => {
  res.json({ success: true, data: req.user });
});

/**
 * @swagger
 * /api/auth/demo-accounts:
 *   get:
 *     summary: Get demo accounts for testing
 *     tags: [Auth]
 *     responses:
 *       200: { description: Demo accounts }
 */
router.get('/demo-accounts', (req, res) => {
  res.json({
    success: true,
    data: [
      { role: 'Admin', email: 'admin@borrowbox.com', password: 'Admin@123', description: 'Full admin access' },
      { role: 'User (Demo)', email: 'demo@borrowbox.com', password: 'Demo@123', description: 'Regular user with items' },
      { role: 'User', email: 'alice@example.com', password: 'User@123', description: 'Another user' },
      { role: 'User', email: 'bob@example.com', password: 'User@123', description: 'Outdoor enthusiast' }
    ]
  });
});

export default router;
