import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/User.model.js';
import { Provider } from '../models/Provider.model.js';

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(ApiError.unauthenticated('Authorization token required'));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(ApiError.unauthenticated('Authorization token required'));
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return next(ApiError.unauthenticated('User account is invalid or inactive'));
    }

    let providerId = user.providerId ? user.providerId.toString() : null;

    // If user is a provider owner, resolve their owned Provider ID
    if (user.role === 'provider') {
      const provider = await Provider.findOne({ ownerId: user._id });
      if (provider) {
        providerId = provider._id.toString();
      }
    }

    req.user = {
      id: user._id.toString(),
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      providerId,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(ApiError.unauthenticated('Token has expired. Please log in again.'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(ApiError.unauthenticated('Invalid authorization token'));
    }
    next(error);
  }
};
