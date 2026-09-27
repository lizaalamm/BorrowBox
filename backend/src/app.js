import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import categoryRoutes from './routes/categories.js';
import itemRoutes from './routes/items.js';
import borrowRequestRoutes from './routes/borrowRequests.js';
import reviewRoutes from './routes/reviews.js';
import notificationRoutes from './routes/notifications.js';
import wishlistRoutes from './routes/wishlist.js';
import dashboardRoutes from './routes/dashboard.js';
import messageRoutes from './routes/messages.js';

const app = express();

// Security & Middleware
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'https://borrowbox.com'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later' }
});
app.use('/api/', limiter);

// Swagger Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: `
    .swagger-ui .topbar { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .swagger-ui .btn.execute { background: #8B5CF6; border-color: #8B5CF6; }
  `,
  customSiteTitle: 'BorrowBox API Docs',
  customfavIcon: '📦'
}));

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '📦 BorrowBox API - Community Lending Platform',
    version: '1.0.0',
    docs: '/api-docs',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      categories: '/api/categories',
      items: '/api/items',
      borrowRequests: '/api/borrow-requests',
      reviews: '/api/reviews',
      notifications: '/api/notifications',
      wishlist: '/api/wishlist',
      dashboard: '/api/dashboard',
      messages: '/api/messages'
    },
    demoAccounts: [
      { email: 'admin@borrowbox.com', password: 'Admin@123', role: 'admin' },
      { email: 'demo@borrowbox.com', password: 'Demo@123', role: 'user' }
    ]
  });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/borrow-requests', borrowRequestRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/messages', messageRoutes);

// 404 & Error handler
app.use(notFound);
app.use(errorHandler);

export default app;
