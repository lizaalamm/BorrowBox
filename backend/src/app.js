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

const isProduction = process.env.NODE_ENV === 'production';

app.disable('x-powered-by');
app.set('trust proxy', 1);

/**
 * Origins allowed to call the API with credentials.
 * Localhost support keeps the Vite dev server and `vite preview` working, and
 * API_ALLOWED_ORIGINS lets deployments add their own hosts.
 */
const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:4173',
  'http://localhost:5173',
  'http://localhost:5174',
  'https://borrowbox.com',
];

const allowedOrigins = (process.env.API_ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https:', 'data:'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", ...defaultOrigins, ...allowedOrigins],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'self'", 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    referrerPolicy: { policy: 'no-referrer' },
    hsts: isProduction ? { maxAge: 63072000, includeSubDomains: true, preload: true } : false,
  })
);

app.use(
  cors({
    origin(origin, callback) {
      // Same-origin requests, curl and server-to-server calls send no origin.
      if (!origin) return callback(null, true);
      const allowlist = [...defaultOrigins, ...allowedOrigins];
      if (allowlist.includes(origin) || (!isProduction && !origin)) return callback(null, true);
      if (!isProduction && /^https?:\/\/[a-z0-9.-]+(:\d+)?$/i.test(origin)) return callback(null, true);
      return callback(new Error('Origin not allowed by CORS policy'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

if (!isProduction) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { skip: (req) => req.path === '/api/health' }));
}

/* --------------------------------------------------------------- rate limits */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down and try again shortly.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Too many authentication attempts. Try again in a few minutes.' },
});

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many write operations. Please try again later.' },
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use(['/api/items', '/api/borrow-requests', '/api/reviews', '/api/wishlist', '/api/messages'], writeLimiter);

/* ------------------------------------------------------------- documentation */
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: `
      .swagger-ui .topbar { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #06b6d4 100%); }
      .swagger-ui .topbar .download-url-wrapper { display: none; }
      .swagger-ui .btn.execute { background: #4f46e5; border-color: #4f46e5; }
      .swagger-ui .info .title { font-weight: 700; }
    `,
    customSiteTitle: 'BorrowBox API documentation',
  })
);

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

/* ------------------------------------------------------------------- health */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'BorrowBox API - community lending platform',
    version: '1.0.0',
    docs: '/api-docs',
    health: '/api/health',
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
      messages: '/api/messages',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
  });
});

/* ------------------------------------------------------------------- routes */
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

app.use(notFound);
app.use(errorHandler);

export default app;
