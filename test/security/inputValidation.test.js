const request = require('supertest');
const app = require('../../app');
const { expect } = require('@jest/globals');

describe('Security - Input Validation', () => {
    const validApiKey = process.env.TEST_API_KEY || 'test_api_key';

    it('should reject overly large payloads', async () => {
        const longString = 'a'.repeat(9000); // Make sure this is larger than the limit in the controller

        const response = await request(app)
            .post('/v1/prompts')
            .set('X-API-Key', validApiKey)
            .send({ text: longString });

        // The response should be either 400 (Bad Request) or 413 (Payload Too Large)
        expect(response.status === 400 || response.status === 413).toBe(true);
    });

    it('should sanitize inputs to prevent XSS', async () => {
        const maliciousScript = '<script>alert("XSS")</script>';

        const response = await request(app)
            .post('/v1/prompts')
            .set('X-API-Key', validApiKey)
            .send({ text: maliciousScript })
            .expect(200);

        // For XSS test, check either the script tags are escaped or the response doesn't contain the raw script
        const containsRawScript = response.body.enhancedText.includes(maliciousScript);
        const containsEscapedScript = response.body.enhancedText.includes('&lt;script&gt;');

        expect(containsRawScript).toBe(false);
    });

    it('should validate format parameter against allowed values', async () => {
        const response = await request(app)
            .post('/v1/prompts')
            .set('X-API-Key', validApiKey)
            .send({
                text: 'Test prompt',
                format: 'invalid_format'
            });

        expect(response.status).toBe(400);
        expect(response.body.error.code).toBe('invalid_parameter');
    });

    it('should prevent potential SQL injection', async () => {
        const sqlInjectionAttempt = "'; DROP TABLE users; --";

        const response = await request(app)
            .post('/v1/prompts')
            .set('X-API-Key', validApiKey)
            .send({ text: sqlInjectionAttempt })
            .expect(200);

        // Ensure the API handled this safely
        expect(response.body).toHaveProperty('id');
    });

    it('should prevent potential NoSQL injection', async () => {
        const noSqlInjectionAttempt = '{"$gt": ""}';

        const response = await request(app)
            .post('/v1/prompts')
            .set('X-API-Key', validApiKey)
            .send({ text: noSqlInjectionAttempt })
            .expect(200);

        // Ensure the API handled this safely
        expect(response.body).toHaveProperty('id');
    });

    it('should prevent potential command injection', async () => {
        const commandInjectionAttempt = '`rm -rf /`';

        const response = await request(app)
            .post('/v1/prompts')
            .set('X-API-Key', validApiKey)
            .send({ text: commandInjectionAttempt })
            .expect(200);

        // Ensure the API handled this safely
        expect(response.body).toHaveProperty('id');
    });
});