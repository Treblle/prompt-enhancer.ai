require('dotenv').config();

/**
 * Application configuration with validation and defaults
 */
const config = {
    // Server configuration
    server: {
        port: parseInt(process.env.PORT, 10) || 5000,
        env: process.env.NODE_ENV || 'development',
        logLevel: process.env.LOG_LEVEL || 'info'
    },

    // API configuration
    api: {
        key: process.env.API_KEY,
        version: '1.0.0',
        baseUrl: '/v1',
    },

    // CORS configuration
    cors: {
        // Allow localhost in development, specific domains in production
        origins: process.env.CORS_ALLOWED_ORIGINS
            ? process.env.CORS_ALLOWED_ORIGINS.split(',')
            : (process.env.NODE_ENV === 'development'
                ? ['http://localhost:3000']
                : ['https://your-production-domain.com']),
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
        maxAge: 86400 // 24 hours
    },

    // Rate limiting configuration
    rateLimit: {
        // General rate limiting
        standard: {
            maxRequests: parseInt(process.env.MAX_REQUESTS_PER_MINUTE, 10) || 100,
            windowMs: 60 * 1000 // 1 minute
        },
        // IP-based rate limiting (DDoS protection)
        ip: {
            maxRequests: parseInt(process.env.IP_MAX_REQUESTS_PER_MINUTE, 10) || 30,
            windowMs: 60 * 1000, // 1 minute
            blockDuration: 5 * 60 * 1000 // 5 minutes
        },
        // API key rate limiting
        apiKey: {
            maxRequests: parseInt(process.env.API_KEY_MAX_REQUESTS_PER_MINUTE, 10) || 100,
            windowMs: 60 * 1000 // 1 minute
        }
    },

    // Redis configuration
    redis: {
        url: process.env.REDIS_URL || null,
        enabled: !!process.env.REDIS_URL
    },

    // AI providers
    ai: {
        provider: process.env.AI_PROVIDER || 'openai',
        openai: {
            apiKey: process.env.OPENAI_API_KEY,
            defaultModel: 'gpt-3.5-turbo'
        },
        mistral: {
            apiKey: process.env.MISTRAL_API_KEY,
            defaultModel: 'mistral-medium'
        }
    }
};

// Validate critical configuration
function validateConfig() {
    const errors = [];

    // API key must be set
    if (!config.api.key) {
        errors.push('API_KEY environment variable must be set');
    }

    // AI provider configuration validation
    if (config.ai.provider === 'openai' && !config.ai.openai.apiKey) {
        errors.push('OPENAI_API_KEY environment variable must be set when using OpenAI');
    }

    if (config.ai.provider === 'mistral' && !config.ai.mistral.apiKey) {
        errors.push('MISTRAL_API_KEY environment variable must be set when using Mistral');
    }

    // Print validation errors if any
    if (errors.length > 0) {
        console.error('Configuration validation errors:');
        errors.forEach(error => console.error(`- ${error}`));

        // Only exit in production mode, allow development to continue with warnings
        if (config.server.env === 'production') {
            throw new Error('Invalid configuration. See logs for details.');
        }
    }
}

// Validate on load
validateConfig();

module.exports = config;