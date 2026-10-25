import { ApiError } from '../utils/ApiError.js';
import mongoose from 'mongoose';

/**
 * Middleware factory to validate request parts against Zod schemas
 * @param {Object} schemas - { body?: ZodSchema, query?: ZodSchema, params?: ZodSchema }
 */
export const validate = (schemas) => {
  return (req, res, next) => {
    try {
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      next();
    } catch (err) {
      if (err.errors) {
        const details = err.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        }));
        return next(ApiError.badRequest('Validation failed', details));
      }
      next(err);
    }
  };
};

/**
 * Middleware to validate that route parameters are valid MongoDB ObjectIds
 * Malformed ObjectIds return 400 VALIDATION_ERROR
 */
export const validateObjectId = (...paramNames) => {
  return (req, res, next) => {
    for (const param of paramNames) {
      const id = req.params[param];
      if (id && !mongoose.Types.ObjectId.isValid(id)) {
        return next(ApiError.badRequest(`Invalid ID format for parameter: ${param}`, { param, value: id }));
      }
    }
    next();
  };
};
