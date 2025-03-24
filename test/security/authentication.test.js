const request = require('supertest');
const app = require('../../app');
const { expect } = require('@jest/globals');

describe('Security - Authentication', () => {
    it('should reject requests without API keys', async () => {
        const response = await request(app)
            .post('/v1/prompts')
            .send({ text: 'Test prompt' });

        expect(response.status).toBe(401);
        expect(response.body.error.code).toBe('missing_api_key');
    });

    it('should reject requests with invalid API keys', async () => {
        const response = await request(app)
            .post('/v1/prompts')
            .set('X-API-Key', 'invalid_key_12345')
            .send({ text: 'Test prompt' });

        expect(response.status).toBe(401);
        expect(response.body.error.code).toBe('invalid_api_key');
    });

    it('should accept requests with valid API keys', async () => {
        const response = await request(app)
            .post('/v1/prompts')
            .set('X-API-Key', process.env.TEST_API_KEY || 'test_api_key')
            .send({ text: 'Test prompt' });

        expect(response.status).toBe(200);
    });

    it('should not expose sensitive information in error responses', async () => {
        const response = await request(app)
            .post('/v1/prompts')
            .set('X-API-Key', 'invalid_key_12345')
            .send({ text: 'Test prompt' });

        // Check that error doesn't include stack traces or sensitive details
        expect(response.body.error).not.toHaveProperty('stack');
        expect(response.body.error).not.toHaveProperty('details.config');
        expect(response.body.error).not.toHaveProperty('details.headers.authorization');
    });

    it('should use constant-time comparison for API keys to prevent timing attacks', async () => {
        // This is hard to test directly, but we can check that the auth middleware
        // handles keys of different lengths securely

        const shortKeyResponse = await request(app)
            .post('/v1/prompts')
            .set('X-API-Key', 'short')
            .send({ text: 'Test prompt' });

        const longKeyResponse = await request(app)
            .post('/v1/prompts')
            .set('X-API-Key', 'a'.repeat(100))
            .send({ text: 'Test prompt' });

        // Both should be rejected with the same error code
        expect(shortKeyResponse.status).toBe(401);
        expect(longKeyResponse.status).toBe(401);
        expect(shortKeyResponse.body.error.code).toBe('invalid_api_key');
        expect(longKeyResponse.body.error.code).toBe('invalid_api_key');
    });
});
