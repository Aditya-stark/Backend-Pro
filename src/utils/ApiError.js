/**
 * Custom error class for API errors.
 *
 * @class ApiError
 * @extends {Error}
 *
 * @param {number} statuscode - The HTTP status code of the error.
 * @param {string} [message="Something went wrong"] - The error message.
 * @param {Array} [errors=[]] - Additional error details.
 * @param {string} [statck=""] - The stack trace of the error.
 *
 * @property {number} statusCode - The HTTP status code of the error.
 * @property {Array} errors - Additional error details.
 * @property {boolean} success - Indicates the success status (always false for errors).
 * @property {null} data - Placeholder for data (always null for errors).
 */

class ApiError extends Error {
  constructor(
    statuscode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statuscode;
    this.errors = errors;
    this.success = false;
    this.data = null;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
  toJSON() {
    return {
      statusCode: this.statusCode,
      message: this.message,
      errors: this.errors,
      success: this.success,
      data: this.data,
    };
  }
}

export { ApiError };
