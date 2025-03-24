const request = require('supertest');
const app = require('../../app');
const { expect } = require('@jest/globals');

describe('POST /v1/prompts', () => {
    it('should enhance a prompt', async () => {
        const response = await request(app)
            .post('/v1/prompts')
            .set('X-API-Key', process.env.TEST_API_KEY || 'test_api_key')
            .send({ text: 'Write about APIs' })
            .expect('Content-Type', /json/)
            .expect(200);

        // Validate response structure
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('originalText', 'Write about APIs');
        expect(response.body).toHaveProperty('enhancedText');
        expect(response.body.enhancedText.length).toBeGreaterThan(20);
    });

    it('should validate required fields', async () => {
        const response = await request(app)
            .post('/v1/prompts')
            .set('X-API-Key', process.env.TEST_API_KEY || 'test_api_key')
            .send({}) // Missing text field
            .expect(400);

        expect(response.body.error.code).toBe('missing_required_field');
    });

    it('should require authentication', async () => {
        const response = await request(app)
            .post('/v1/prompts')
            .send({ text: 'Test' })
            .expect(401);

        expect(response.body.error.code).toBe('missing_api_key');
    });

    it('should accept different format options', async () => {
        const response = await request(app)
            .post('/v1/prompts')
            .set('X-API-Key', process.env.TEST_API_KEY || 'test_api_key')
            .send({
                text: 'Write about APIs',
                format: 'bullet'
            })
            .expect(200);

        expect(response.body.format).toBe('bullet');
    });
});