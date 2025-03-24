const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
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
        const allowedOrigins = process.env.NODE_ENV === 'development'
            ? ['http://localhost:3000', 'http://127.0.0.1:3000']
            : ['https://prompt-enhancer.ai'];

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