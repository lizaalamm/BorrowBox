import Joi from 'joi';

/**
 * Input hardening helpers.
 *
 * Values are stored as JSON and rendered by React (which escapes by default),
 * but stripping tag characters and control codes here keeps stored data clean
 * and neutralises payloads before they ever reach a database or an email.
 */
export const stripTags = (value = '') =>
  String(value)
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/<[^>]*>/g, '')
    .trim();

const safeString = (max) =>
  Joi.string()
    .max(max)
    .custom((value, helpers) => {
      const cleaned = stripTags(value);
      if (!cleaned) return helpers.error('string.empty');
      return cleaned;
    }, 'sanitisation');

const optionalSafeString = (max) =>
  Joi.string()
    .allow('')
    .max(max)
    .custom((value) => stripTags(value), 'sanitisation');

const strongPassword = Joi.string()
  .min(8)
  .max(100)
  .pattern(/[a-z]/, 'lowercase letter')
  .pattern(/[A-Z]/, 'uppercase letter')
  .pattern(/\d/, 'number')
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.pattern.name': 'Password must include at least one {#name}',
  });

export const registerSchema = Joi.object({
  name: safeString(50).min(2).required(),
  email: Joi.string().email().max(120).lowercase().required(),
  password: strongPassword,
  location: optionalSafeString(100),
  bio: optionalSafeString(500),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().max(120).lowercase().required(),
  password: Joi.string().max(100).required(),
});

export const profileUpdateSchema = Joi.object({
  name: safeString(50).min(2).optional(),
  bio: optionalSafeString(500).optional(),
  location: optionalSafeString(100).optional(),
  avatar: Joi.string().max(500).allow('').uri({ scheme: ['http', 'https'] }).optional(),
}).min(1);

export const passwordChangeSchema = Joi.object({
  currentPassword: Joi.string().min(8).max(100).required(),
  newPassword: strongPassword.required(),
});

export const itemSchema = Joi.object({
  title: safeString(100).min(3).required(),
  description: safeString(2000).min(10).required(),
  category: optionalSafeString(60),
  categoryId: Joi.string().max(60).allow('', null).optional(),
  condition: Joi.string().valid('New', 'Like New', 'Good', 'Fair').required(),
  value: Joi.number().min(0).max(1000000).required(),
  lendingFee: Joi.number().min(0).max(10000).default(0),
  location: safeString(200).min(2).required(),
  tags: Joi.array().items(Joi.string().max(30)).max(15).optional(),
  images: Joi.array().items(Joi.string().uri({ scheme: ['http', 'https'] }).max(500)).max(6).optional(),
}).or('category', 'categoryId');

export const itemUpdateSchema = Joi.object({
  title: safeString(100).min(3).optional(),
  description: safeString(2000).min(10).optional(),
  condition: Joi.string().valid('New', 'Like New', 'Good', 'Fair').optional(),
  value: Joi.number().min(0).max(1000000).optional(),
  lendingFee: Joi.number().min(0).max(10000).optional(),
  availability: Joi.string().valid('available', 'borrowed', 'reserved', 'unavailable').optional(),
  location: safeString(200).min(2).optional(),
  tags: Joi.array().items(Joi.string().max(30)).max(15).optional(),
  images: Joi.array().items(Joi.string().uri({ scheme: ['http', 'https'] }).max(500)).max(6).optional(),
  category: optionalSafeString(60).optional(),
  categoryId: Joi.string().max(60).allow('', null).optional(),
}).min(1);

export const borrowRequestSchema = Joi.object({
  itemId: Joi.string().max(60).required(),
  startDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({ 'string.pattern.base': 'startDate must use the YYYY-MM-DD format' }),
  endDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({ 'string.pattern.base': 'endDate must use the YYYY-MM-DD format' }),
  message: optionalSafeString(500),
});

export const borrowStatusSchema = Joi.object({
  status: Joi.string()
    .valid('approved', 'rejected', 'borrowed', 'returned', 'completed', 'cancelled', 'overdue')
    .required(),
  ownerMessage: optionalSafeString(500),
});

export const reviewSchema = Joi.object({
  itemId: Joi.string().max(60).required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: safeString(1000).min(5).required(),
  type: Joi.string().valid('item', 'user').default('item'),
});

export const messageSchema = Joi.object({
  receiverId: Joi.string().max(60).required(),
  text: safeString(2000).min(1).required(),
  itemId: Joi.string().max(60).allow(null, '').optional(),
});

export const categorySchema = Joi.object({
  name: safeString(60).min(2).required(),
  slug: Joi.string().max(60).pattern(/^[a-z0-9-]+$/).required(),
  description: optionalSafeString(200),
  icon: Joi.string().max(40).optional(),
  color: Joi.string().pattern(/^#[0-9a-fA-F]{6}$/).optional(),
});

/** Shared helper for query parameters that must stay within sane bounds. */
export const clampInt = (value, { min = 0, max = 100, fallback = min } = {}) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
};

export const clampNumber = (value, { min = 0, max = 1000000, fallback = null } = {}) => {
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
};
