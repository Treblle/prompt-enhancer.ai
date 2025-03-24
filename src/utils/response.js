/**
 * Creates a standardized success response
 */
function success(data, meta = {}) {
    return {
        success: true,
        data,
        meta
    };
}

/**
 * Creates a standardized error response
 */
function error(code, message, details = null) {
    const response = {
        success: false,
        error: {
            code,
            message
        }
    };

    if (details) {
        response.error.details = details;
    }

    return response;
}

module.exports = {
    success,
    error
};