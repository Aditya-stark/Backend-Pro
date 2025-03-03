/**
 * A higher-order function that wraps an asynchronous function and handles any errors that occur.
 *
 * @param {Function} func - The asynchronous function to be wrapped.
 * @returns {Function} A function that takes req, res, and next as arguments and handles errors by passing them to the next middleware.
 */

// First method which uses promise to create a async functon and handle the error
const asyncHandler = (func) => {
  return (req, res, next) => {
    Promise.resolve(func(req, res, next)).catch((error) => next(error));
  };
};



//--Second method which uses try catch and wrap create a async functon and handle the error
// const asyncHandler = (func) => async (req, res, next) => {
//   try {
//     await func(req, res, next);
//   } catch (error) {
//     console.log("Error connecting to MONGO DB", error);
//     res
//       .status(error.code || 500)
//       .json({ sucess: false, message: error.message });
//   }
// };

export { asyncHandler };
