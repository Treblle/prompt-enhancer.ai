
/**
 * This file provides mock objects and helper functions for security tests
 */

/**
 * Mock response object for middleware testing
 * @returns {Object} Mock response object
 */
function createMockResponse() {
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        headers: {},
        statusCode: 200,
        getHeader: function (name) {
            return this.headers[name];
        },
        setHeader: function (name, value) {
            this.headers[name] = value;
        }
    };
    return res;
}

/**
 * Mock request object for middleware testing
 * @param {Object} options - Request options
 * @returns {Object} Mock request object
 */
function createMockRequest(options = {}) {
    const {
        headers = {},
        body = {},
        ip = '127.0.0.1',
        method = 'GET',
        path = '/'
    } = options;

    return {
        headers,
        body,
        ip,
        method,
        path,
        header: function (name) {
            return this.headers[name];
        }
    };
}

/**
 * Test double for rate limiter
 */
const mockRateLimiter = {
    consume: jest.fn().mockResolvedValue(true),
    block: jest.fn().mockResolvedValue(true),
    penalty: jest.fn().mockResolvedValue(true),
    get: jest.fn().mockResolvedValue({
        consumedPoints: 0,
        remainingPoints: 100,
        msBeforeNext: 60000,
        isBlocked: false
    })
};

module.exports = {
    createMockResponse,
    createMockRequest,
    mockRateLimiter
};