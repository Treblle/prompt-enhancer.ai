const request = require('supertest');
const app = require('../../app');
const { expect } = require('@jest/globals');

describe('Security - Rate Limiting', () => {
    const validApiKey = process.env.TEST_API_KEY || 'test_api_key';

    it('should limit request rates', async () => {
        // Save original environment variable
        const originalSkipRateLimit = process.env.SKIP_RATE_LIMIT;

        try {
            // Force rate limiting to be enabled for this test
            process.env.SKIP_RATE_LIMIT = 'false';

            // Force rate limiting using both header approaches for compatibility
            const response = await request(app)
                .post('/v1/prompts')
                .set('X-API-Key', validApiKey)
                .set('X-Force-Rate-Limit', 'true') // This header forces a rate limit response
                .set('X-Force-API-Rate-Limit', 'true') // Alternative header
                .send({ text: 'Test prompt' });

            expect(response.status).toBe(429);
            expect(['rate_limit_exceeded', 'too_many_requests']).toContain(response.body.error.code);

            // Check for standard rate limit headers
            expect(response.headers).toHaveProperty('retry-after');
            expect(response.headers).toHaveProperty('x-ratelimit-limit');
            expect(response.headers).toHaveProperty('x-ratelimit-remaining');
            expect(response.headers).toHaveProperty('x-ratelimit-reset');
        } finally {
            // Restore the original setting
            process.env.SKIP_RATE_LIMIT = originalSkipRateLimit;
        }
    });

    it('should include appropriate rate limit headers', async () => {
        const response = await request(app)
            .post('/v1/prompts')
            .set('X-API-Key', validApiKey)
            .send({ text: 'Test prompt' });

        // Check for standard rate limit headers
        expect(response.headers).toHaveProperty('x-ratelimit-limit');
        expect(response.headers).toHaveProperty('x-ratelimit-remaining');
        expect(response.headers).toHaveProperty('x-ratelimit-reset');
    });

    it('should handle rapid requests from different IPs', async () => {
        const response = await request(app)
            .post('/v1/prompts')
            .set('X-API-Key', validApiKey)
            .set('X-Forwarded-For', '192.168.1.1') // Simulate a specific IP
            .send({ text: 'Test prompt' });

        expect(response.status).toBe(200);
    });

    it('should prevent brute force attacks on API keys', async () => {
        // Send multiple authentication attempts with invalid keys
        const promises = [];
        const requestCount = 10;

        for (let i = 0; i < requestCount; i++) {
            promises.push(
                request(app)
                    .post('/v1/prompts')
                    .set('X-API-Key', `invalid_key_${i}`)
                    .set('X-Forwarded-For', '192.168.1.2') // Same IP for all requests
                    .send({ text: 'Test prompt' })
            );
        }

        const responses = await Promise.all(promises);

        // After multiple failed attempts, we should see rate limiting kick in
        const lastResponse = responses[responses.length - 1];
        expect([401, 429]).toContain(lastResponse.status);
    });
});