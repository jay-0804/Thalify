import { ApiError } from '../utils/ApiError.js';

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthenticated());
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(`Access forbidden: requires one of roles [${roles.join(', ')}]`)
      );
    }

    next();
  };
};
