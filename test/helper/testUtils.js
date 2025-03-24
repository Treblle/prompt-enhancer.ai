/**
 * Utility functions for testing
 */

const crypto = require('crypto');
const request = require('supertest');

/**
 * Generate a test API key
 * @returns {string} A random API key for testing
 */
function generateTestApiKey() {
    return crypto.randomBytes(16).toString('hex');
}

/**
 * Create a test prompt for testing purposes
 * @param {Object} app - Express app instance
 * @param {string} apiKey - API key to use
 * @param {string} text - Text for the prompt
 * @returns {Promise<Object>} - The created prompt
 */
async function createTestPrompt(app, apiKey, text = 'Test prompt') {
    const response = await request(app)
        .post('/v1/prompts')
        .set('X-API-Key', apiKey)
        .send({ text });

    return response.body;
}

/**
 * Generates test data for a specified number of requests
 * @param {number} count - Number of requests to generate
 * @returns {Array<Object>} Array of request data
 */
function generateTestRequests(count) {
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push({
            text: `Test prompt ${i}`,
            format: 'structured'
        });
    }
    return result;
}

/**
 * Make multiple API requests in parallel
 * @param {Object} app - Express app instance
 * @param {string} apiKey - API key to use
 * @param {number} count - Number of requests to make
 * @returns {Promise<Array<Object>>} Array of responses
 */
async function makeParallelRequests(app, apiKey, count) {
    const requests = [];
    const testData = generateTestRequests(count);

    for (let i = 0; i < count; i++) {
        requests.push(
            request(app)
                .post('/v1/prompts')
                .set('X-API-Key', apiKey)
                .send(testData[i])
        );
    }

    return Promise.all(requests);
}

/**
 * Makes an invalid API request with an incorrect API key
 * @param {Object} app - Express app instance
 * @param {string} text - Text for the prompt
 * @returns {Promise<Object>} The response
 */
async function makeInvalidAuthRequest(app, text = 'Test prompt') {
    return request(app)
        .post('/v1/prompts')
        .set('X-API-Key', 'invalid_api_key')
        .send({ text });
}

/**
 * Wait for a specified duration
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    generateTestApiKey,
    createTestPrompt,
    generateTestRequests,
    makeParallelRequests,
    makeInvalidAuthRequest,
    wait
};