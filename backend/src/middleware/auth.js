import jwt from 'jsonwebtoken';
import storage from '../config/storage.js';

const DEV_FALLBACK_SECRET = 'borrowbox-development-secret-change-me-32-chars';
const TOKEN_ISSUER = 'borrowbox-api';
const TOKEN_TTL = '7d';

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be configured in production');
}

const JWT_SECRET = process.env.JWT_SECRET || DEV_FALLBACK_SECRET;

if (!process.env.JWT_SECRET && process.env.NODE_ENV !== 'production') {
  console.warn('[auth] JWT_SECRET is not set. Using the development fallback secret. Do not use this in production.');
}

const SIGN_OPTIONS = { expiresIn: TOKEN_TTL, issuer: TOKEN_ISSUER, algorithm: 'HS256' };
const VERIFY_OPTIONS = { issuer: TOKEN_ISSUER, algorithms: ['HS256'] };

/** Removes credential fields before a user object is sent over the wire. */
export const toSafeUser = (user, { includeEmail = false } = {}) => {
  if (!user) return null;
  const { password, ...rest } = user;
  if (includeEmail) return rest;
  const { email, ...publicFields } = rest;
  return publicFields;
};

export const authenticate = (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (!token || scheme.toLowerCase() !== 'bearer') {
    return res.status(401).json({ success: false, message: 'Authentication required. Please sign in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, VERIFY_OPTIONS);

    // Tokens carry an id, but the record is always re-read so revocations and
    // role changes take effect immediately.
    const user = storage.findById('users', decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Account no longer exists' });
    }

    req.user = toSafeUser(user, { includeEmail: true });
    return next();
  } catch (error) {
    const expired = error.name === 'TokenExpiredError';
    return res.status(401).json({
      success: false,
      message: expired ? 'Session expired. Please sign in again.' : 'Invalid authentication token',
    });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'You do not have permission to perform this action' });
  }
  return next();
};

export const generateToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, SIGN_OPTIONS);

export default { authenticate, authorize, generateToken, toSafeUser };
