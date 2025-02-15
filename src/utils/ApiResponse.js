/**
 * ApiResponse class to format the response. This class will be used to format the response in a consistent way. It will have the following properties: `statusCode`, `data`, `message`, and `success`.
 * @param {number} statusCode - HTTP status code of the response.
 * @param {object} data - Data to be sent in the response.
 * @param {string} message - Message to be sent in the response.
 * @returns {object} - Formatted response object.
 * @example
 * const response = new ApiResponse(200, { id: 1, name: "John Doe" }, "Success");
 * console.log(response);
 * // Output: { statusCode: 200, data: { id: 1, name: "John Doe" }, message: "Success
 */

class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export { ApiResponse };
