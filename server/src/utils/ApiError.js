export class ApiError extends Error {
  constructor(statusCode, code, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details = null) {
    return new ApiError(400, 'VALIDATION_ERROR', message, details);
  }

  static unauthenticated(message = 'Authentication required') {
    return new ApiError(401, 'UNAUTHENTICATED', message);
  }

  static invalidCredentials(message = 'Invalid email or password') {
    return new ApiError(401, 'INVALID_CREDENTIALS', message);
  }

  static forbidden(message = 'You do not have permission to access this resource') {
    return new ApiError(403, 'FORBIDDEN', message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, 'NOT_FOUND', message);
  }

  static conflict(code, message, details = null) {
    return new ApiError(409, code, message, details);
  }

  static cutoffPassed(message = 'Cutoff time has passed for this meal', details = null) {
    return new ApiError(409, 'CUTOFF_PASSED', message, details);
  }

  static invalidState(message = 'Operation not valid for current resource state', details = null) {
    return new ApiError(409, 'INVALID_STATE', message, details);
  }

  static alreadyFinalized(message = 'Task is already finalized', details = null) {
    return new ApiError(409, 'ALREADY_FINALIZED', message, details);
  }

  static duplicateSubscription(message = 'Active subscription already exists for this plan in date range') {
    return new ApiError(409, 'DUPLICATE_SUBSCRIPTION', message);
  }

  static overpayment(message = 'Payment exceeds outstanding balance', details = null) {
    return new ApiError(409, 'OVERPAYMENT', message, details);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, 'INTERNAL', message);
  }
}
