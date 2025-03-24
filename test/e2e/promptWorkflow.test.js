const request = require('supertest');
const app = require('../../app');
const { expect } = require('@jest/globals');

describe('Prompt API E2E', () => {
    let promptId;

    it('should create a new prompt', async () => {
        const response = await request(app)
            .post('/v1/prompts')
            .set('X-API-Key', process.env.TEST_API_KEY || 'test_api_key')
            .send({ text: 'Test E2E prompt' });

        promptId = response.body.id;
        expect(response.status).toBe(200);
        expect(promptId).toBeDefined();
    });

    it('should retrieve the created prompt', async () => {
        const response = await request(app)
            .get(`/v1/prompts/${promptId}`)
            .set('X-API-Key', process.env.TEST_API_KEY || 'test_api_key');

        expect(response.status).toBe(200);
        expect(response.body.id).toBe(promptId);
        expect(response.body.originalText).toBe('Test E2E prompt');
    });

    it('should update the prompt', async () => {
        const response = await request(app)
            .put(`/v1/prompts/${promptId}`)
            .set('X-API-Key', process.env.TEST_API_KEY || 'test_api_key')
            .send({ text: 'Updated E2E prompt' });

        expect(response.status).toBe(200);
        expect(response.body.originalText).toBe('Updated E2E prompt');
    });

    it('should delete the prompt', async () => {
        await request(app)
            .delete(`/v1/prompts/${promptId}`)
            .set('X-API-Key', process.env.TEST_API_KEY || 'test_api_key')
            .expect(204);

        // Verify it's gone
        await request(app)
            .get(`/v1/prompts/${promptId}`)
            .set('X-API-Key', process.env.TEST_API_KEY || 'test_api_key')
            .expect(404);
    });

    it('should list all prompts', async () => {
        // Create a few prompts first
        await request(app)
            .post('/v1/prompts')
            .set('X-API-Key', process.env.TEST_API_KEY || 'test_api_key')
            .send({ text: 'First test prompt' });

        await request(app)
            .post('/v1/prompts')
            .set('X-API-Key', process.env.TEST_API_KEY || 'test_api_key')
            .send({ text: 'Second test prompt' });

        // Get the list
        const response = await request(app)
            .get('/v1/prompts')
            .set('X-API-Key', process.env.TEST_API_KEY || 'test_api_key');

        expect(response.status).toBe(200);
        expect(response.body.prompts).toBeInstanceOf(Array);
        expect(response.body.prompts.length).toBeGreaterThan(0);
        expect(response.body.total).toBeGreaterThan(0);
    });
});