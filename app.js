const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const treblle = require('@treblle/express');
const { errorHandler } = require('./src/middleware/error');
const { authenticateApiKey } = require('./src/middleware/auth');
const { rateLimit, ddosProtection } = require('./src/middleware/rate-limit');

const promptRoutes = require('./src/routes/prompts');

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https://cdn.prod.website-files.com"],
            connectSrc: ["'self'", "http://localhost:3000", "http://localhost:5000"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));

// Apply Treblle logging only in production environments
if (process.env.NODE_ENV === 'production') {
    const treblleApiKey = process.env.TREBLLE_API_KEY;
    const treblleProjectId = process.env.TREBLLE_PROJECT_ID;

    console.log('Treblle Configuration:');
    console.log(`API Key: ${treblleApiKey ? treblleApiKey.substring(0, 4) + '...' : 'Not Set'}`);
    console.log(`Project ID: ${treblleProjectId || 'Not Set'}`);

    // Added detailed environment variables check
    console.log('Environment Variables Check:');
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`TREBLLE_API_KEY exists: ${!!process.env.TREBLLE_API_KEY}`);
    console.log(`TREBLLE_PROJECT_ID exists: ${!!process.env.TREBLLE_PROJECT_ID}`);

    if (treblleApiKey && treblleProjectId) {
        try {
            app.use(treblle({
                apiKey: treblleApiKey,
                projectId: treblleProjectId,
            }));
            console.log('🔍 Treblle API monitoring successfully enabled for production');
        } catch (error) {
            console.error('❌ Failed to initialize Treblle:', error);
            console.error('Error details:', error.message);
            if (error.stack) console.error('Stack trace:', error.stack);
        }
    } else {
        console.warn('⚠️ Treblle not configured: Missing API Key or Project ID');

        // Try alternative approach with direct initialization
        console.log('Attempting alternative Treblle initialization approach...');
        try {
            app.use(treblle());
            console.log('🔍 Alternative Treblle initialization approach attempted');
        } catch (altError) {
            console.error('❌ Alternative approach also failed:', altError.message);
        }
    }
}

// Logging middleware for debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Parse JSON bodies
app.use(express.json({ limit: '50kb' })); // Limit payload size

// CORS configuration with detailed logging
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
            ? process.env.CORS_ALLOWED_ORIGINS.split(',')
            : (process.env.NODE_ENV === 'development'
                ? ['http://localhost:3000', 'http://127.0.0.1:3000']
                : ['https://prompt-enhancer.ai', 'https://www.prompt-enhancer.ai']);

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-API-Key', 'Origin', 'Accept'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Enable CORS for all routes
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// DDoS protection - Apply to all routes
app.use(ddosProtection());

// Apply rate limiting to all API routes
const apiLimiter = rateLimit({
    maxRequests: 100, // 100 requests
    windowMs: 60 * 1000 // per minute
});

// API routes
app.use('/v1/prompts', authenticateApiKey, apiLimiter, promptRoutes);

// Landing page route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the AI Prompt Enhancer API',
        version: '1.0.0',
        documentation: '/docs'
    });
});

// Documentation route
app.get('/docs', (req, res) => {
    res.json({
        name: 'AI Prompt Enhancer API',
        version: '1.0.0',
        description: 'An API that takes basic prompts and enhances them for better AI responses from LLM models like GPT-4, Claude, and Gemini.',
        baseUrl: '/v1',
        authentication: 'API Key Authentication (X-API-Key header)',
        endpoints: [
            {
                path: '/v1/prompts',
                methods: ['GET', 'POST'],
                description: 'List or create enhanced prompts'
            },
            {
                path: '/v1/prompts/:id',
                methods: ['GET', 'PUT', 'DELETE'],
                description: 'Get, update, or delete a specific prompt'
            },
        ],
        rateLimits: '100 requests per minute'
    });
});

app.get('/api-check', (req, res) => {
    // Enhanced api-check with more details for Treblle troubleshooting
    res.json({
        apiKeyConfigured: !!process.env.API_KEY,
        apiKeyFirstFour: process.env.API_KEY ? process.env.API_KEY.substring(0, 4) : null,
        openAIConfigured: !!process.env.OPENAI_API_KEY,
        nodeEnv: process.env.NODE_ENV,
        corsOrigins: process.env.CORS_ALLOWED_ORIGINS,
        treblleConfigured: process.env.NODE_ENV === 'production'
            ? {
                apiKeyConfigured: !!process.env.TREBLLE_API_KEY,
                apiKeyFirstFour: process.env.TREBLLE_API_KEY ? process.env.TREBLLE_API_KEY.substring(0, 4) : 'Not Set',
                projectIdConfigured: !!process.env.TREBLLE_PROJECT_ID,
                projectIdFirstFour: process.env.TREBLLE_PROJECT_ID ? process.env.TREBLLE_PROJECT_ID.substring(0, 4) : 'Not Set'
            }
            : 'Disabled in non-production'
    });
});

// Global error handler
app.use(errorHandler);

// Error handling for non-existent routes
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.statusCode = 404;
    error.code = 'resource_not_found';
    next(error);
});

module.exports = app;