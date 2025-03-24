/**
 * Test data for API testing
 * Contains sample requests, expected responses, and test cases for different scenarios
 */
module.exports = {
    // Test API key for authentication tests
    TEST_API_KEY: process.env.TEST_API_KEY || 'test_api_key',

    // Valid test prompts for various scenarios
    validPrompts: [
        { text: 'Write about API testing', format: 'structured' },
        { text: 'Explain quantum computing', format: 'paragraph' },
        { text: 'List benefits of exercise', format: 'bullet' }
    ],

    // Invalid test prompts
    invalidPrompts: [
        { format: 'structured' }, // Missing text
        { text: '' }, // Empty text
        { text: 'Test', format: 'invalid_format' } // Invalid format
    ],

    // Security test data
    securityTests: {
        xss: '<script>alert("XSS")</script>',
        sqlInjection: "'; DROP TABLE users; --",
        commandInjection: '`rm -rf /`',
        largePayload: 'a'.repeat(10000)
    },

    // Expected response structure
    responseShape: {
        id: expect.any(String),
        originalText: expect.any(String),
        enhancedText: expect.any(String),
        format: expect.stringMatching(/^(paragraph|bullet|structured|conversational)$/),
        createdAt: expect.any(String)
    },

    // Mock responses for OpenAI API
    mockResponses: {
        openai: {
            success: {
                choices: [
                    {
                        message: {
                            content: "As an expert in API design, I'll provide a comprehensive explanation of REST API principles. First, understand that REST (Representational State Transfer) is an architectural style for distributed systems, not a strict protocol. Key principles include:\n\n1. **Statelessness**: Each request contains all information needed to complete it\n2. **Client-Server Architecture**: Separation of concerns between UI/client and data storage/server\n3. **Cacheable Responses**: Responses should indicate if they're cacheable\n4. **Layered System**: Client can't tell if connected directly to end server\n5. **Uniform Interface**: Resources are identified in requests, manipulated through representations, self-descriptive messages, and HATEOAS (Hypermedia as the Engine of Application State)\n\nResources should be nouns (not verbs), use HTTP methods appropriately (GET, POST, PUT, DELETE), implement proper status codes, and version your API. Consider implementing pagination for large resource collections, consistent error handling, and comprehensive documentation."
                        }
                    }
                ]
            },
            error: {
                error: {
                    message: "The API key provided is invalid or has expired.",
                    type: "invalid_request_error",
                    code: "invalid_api_key"
                }
            }
        },
        mistral: {
            success: {
                choices: [
                    {
                        message: {
                            content: "As an expert in API design, I'll provide a comprehensive explanation of REST API principles. First, understand that REST (Representational State Transfer) is an architectural style for distributed systems, not a strict protocol. Key principles include:\n\n1. **Statelessness**: Each request contains all information needed to complete it\n2. **Client-Server Architecture**: Separation of concerns between UI/client and data storage/server\n3. **Cacheable Responses**: Responses should indicate if they're cacheable\n4. **Layered System**: Client can't tell if connected directly to end server\n5. **Uniform Interface**: Resources are identified in requests, manipulated through representations, self-descriptive messages, and HATEOAS (Hypermedia as the Engine of Application State)\n\nResources should be nouns (not verbs), use HTTP methods appropriately (GET, POST, PUT, DELETE), implement proper status codes, and version your API. Consider implementing pagination for large resource collections, consistent error handling, and comprehensive documentation."
                        }
                    }
                ]
            },
            error: {
                error: {
                    message: "Authentication error: Invalid API key provided",
                    type: "auth_error",
                    status: 401
                }
            }
        }
    }
};