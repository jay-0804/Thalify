import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let code = 'INTERNAL';
  let message = 'An unexpected server error occurred';
  let details = null;

  // Handle known ApiError
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  }
  // Handle Mongoose CastError (e.g. malformed ObjectId)
  else if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = `Invalid ID format for parameter: ${err.path}`;
    details = { path: err.path, value: err.value };
  }
  // Handle Mongo duplicate key error (E11000)
  else if (err.code === 11000) {
    statusCode = 409;
    const key = Object.keys(err.keyValue || {})[0];
    if (key === 'email') {
      code = 'EMAIL_EXISTS';
      message = 'An account with this email already exists';
    } else {
      code = 'DUPLICATE_RESOURCE';
      message = `Duplicate value for field: ${key}`;
    }
    details = err.keyValue;
  }
  // Handle Zod validation errors if caught here
  else if (err.name === 'ZodError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));
  }
  // Generic fallback
  else if (err.message) {
    message = err.message;
  }

  // Hide stack trace in production
  if (env.NODE_ENV !== 'production' && statusCode === 500) {
    console.error('[Unhandled Error]', err);
  }

  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
      ...(env.NODE_ENV === 'development' && statusCode === 500 ? { stack: err.stack } : {}),
    },
  });
};
