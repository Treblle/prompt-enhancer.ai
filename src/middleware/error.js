/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.errorHandler = (err, req, res, next) => {
    // Enhanced error logging
    console.error(`[ERROR][${new Date().toISOString()}]`);
    console.error(`Error Name: ${err.name}`);
    console.error(`Error Message: ${err.message}`);
    console.error(`Error Stack: ${err.stack}`);
    console.error(`Request Method: ${req.method}`);
    console.error(`Request Path: ${req.path}`);
    console.error(`Request Headers: ${JSON.stringify(req.headers)}`);
    console.error(`Request Body: ${JSON.stringify(req.body)}`);

    // Normalize the error
    const statusCode = err.statusCode || 500;
    const errorCode = err.code || 'server_error';

    // Detailed error response
    const errorResponse = {
        error: {
            code: errorCode,
            message: process.env.NODE_ENV === 'production'
                ? getPublicErrorMessage(statusCode, errorCode)
                : err.message || 'Internal server error',
            details: process.env.NODE_ENV !== 'production'
                ? {
                    name: err.name,
                    stack: err.stack,
                    originalError: err.toString()
                }
                : undefined
        }
    };

    // Send error response
    res.status(statusCode).json(errorResponse);
};

/**
 * Provides user-friendly error messages for production
 * @param {number} statusCode - HTTP status code
 * @param {string} errorCode - Error code
 * @returns {string} User-friendly error message
 */
function getPublicErrorMessage(statusCode, errorCode) {
    switch (statusCode) {
        case 400: return 'Invalid request parameters';
        case 401: return 'Authentication required';
        case 403: return 'Access denied';
        case 404: return 'Resource not found';
        case 429: return 'Too many requests';
        case 500:
        default:
            return 'An unexpected error occurred. Please try again later.';
    }
};