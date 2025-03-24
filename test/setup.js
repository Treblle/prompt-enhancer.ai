// This file configures the test environment

// Load test environment variables
process.env.NODE_ENV = 'test';
process.env.TEST_API_KEY = 'test_api_key';
process.env.API_KEY = 'api_key_12345';
process.env.SKIP_RATE_LIMIT = 'true';

// Configure OpenAI API key for test environment
process.env.OPENAI_API_KEY = 'sk-test123456789';

// Set up global test timeouts
jest.setTimeout(30000); // 30 second timeout for tests

// Instead of importing OpenAI directly, mock it at the module level
jest.mock('openai', () => {
    return {
        OpenAI: jest.fn().mockImplementation(() => ({
            chat: {
                completions: {
                    create: jest.fn().mockResolvedValue({
                        choices: [{ message: { content: 'Mocked enhanced prompt response' } }]
                    })
                }
            }
        }))
    };
});

// Global setup before all tests
beforeAll(async () => {
    console.log('Setting up test environment...');
    // Add any global setup needed
});

// Global teardown after all tests
afterAll(async () => {
    console.log('Tearing down test environment...');
    // Add any cleanup needed
});