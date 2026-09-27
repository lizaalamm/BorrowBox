import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  location: Joi.string().max(100).optional(),
  bio: Joi.string().max(500).optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const itemSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(2000).required(),
  category: Joi.string().required(),
  categoryId: Joi.string().optional(),
  condition: Joi.string().valid('New', 'Like New', 'Good', 'Fair').required(),
  value: Joi.number().min(0).required(),
  lendingFee: Joi.number().min(0).default(0),
  location: Joi.string().max(200).required(),
  tags: Joi.array().items(Joi.string()).optional(),
  images: Joi.array().items(Joi.string().uri()).optional()
});

export const borrowRequestSchema = Joi.object({
  itemId: Joi.string().required(),
  startDate: Joi.string().required(),
  endDate: Joi.string().required(),
  message: Joi.string().max(500).optional()
});

export const reviewSchema = Joi.object({
  itemId: Joi.string().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().min(5).max(1000).required(),
  type: Joi.string().valid('item', 'user').default('item')
});
