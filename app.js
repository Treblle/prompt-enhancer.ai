const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const treblle = require('@treblle/express');
const { errorHandler } = require('./src/middleware/error');
const { authenticateToken } = require('./src/middleware/auth');
const config = require('./src/config/config');

// Import enhanced security and rate limiting middleware
const {
    initializeRateLimiters,
    applySecurityMiddleware,
    rateLimitMiddleware,
    ddosProtectionMiddleware,
    cdnMiddleware,
    securityHeadersMiddleware
} = require('./src/middleware/security');

const promptRoutes = require('./src/routes/prompts');
const authRoutes = require('./src/routes/auth');

const app = express();

// Initialize rate limiters
(async () => {
    await initializeRateLimiters();
    console.log('✅ Rate limiters initialized successfully');
})();

// Apply security middleware with improved CSP and other protections
applySecurityMiddleware(app);

// Add CDN detection middleware with better caching
app.use(cdnMiddleware());

// Apply explicit security headers to all responses
app.use(securityHeadersMiddleware());

// Apply Treblle logging only in production environments
if (process.env.NODE_ENV === 'production') {
    const treblleApiKey = process.env.TREBLLE_API_KEY;
    const treblleProjectId = process.env.TREBLLE_PROJECT_ID;

    if (treblleApiKey && treblleProjectId) {
        try {
            app.use(treblle({
                apiKey: treblleApiKey,
                projectId: treblleProjectId,
            }));
            console.log('🔍 Treblle API monitoring successfully enabled for production');
        } catch (error) {
            console.error('❌ Failed to initialize Treblle:', error.message);
        }
    } else {
        console.warn('⚠️ Treblle not configured: Missing API Key or Project ID');
    }
}

// Logging middleware for debugging - sanitized for production
app.use((req, res, next) => {
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    }
    next();
});

// Parse JSON bodies with increased limit for SEO payload
app.use(express.json({ limit: '100kb' }));

// CORS configuration with detailed logging
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
            ? process.env.CORS_ALLOWED_ORIGINS.split(',')
            : (process.env.NODE_ENV === 'development'
                ? ['http://localhost:3000', 'http://127.0.0.1:3000']
                : ['https://prompt-enhancer.ai', 'https://www.prompt-enhancer.ai', 'https://cdn.prompt-enhancer.ai']);

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'Origin', 'Accept', 'Content-Encoding'],
    exposedHeaders: ['Content-Encoding', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    credentials: true,
    optionsSuccessStatus: 200,
    maxAge: 86400 // 24 hours
};

// Enable CORS for all routes
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// DDoS protection - Apply to all routes
app.use(ddosProtectionMiddleware());

// Load OpenAPI specification
let openApiSpec;
try {
    // Try the public directory first (where generate-docs puts it)
    const publicOpenApiPath = path.join(__dirname, 'public', 'openapi.json');
    const rootOpenApiPath = path.join(__dirname, 'openapi.json');

    if (fs.existsSync(publicOpenApiPath)) {
        console.log('Loading OpenAPI specification from public directory');
        openApiSpec = JSON.parse(fs.readFileSync(publicOpenApiPath, 'utf8'));
    } else if (fs.existsSync(rootOpenApiPath)) {
        console.log('Loading OpenAPI specification from root directory');
        openApiSpec = JSON.parse(fs.readFileSync(rootOpenApiPath, 'utf8'));
    } else {
        console.warn('OpenAPI specification file not found, will use empty spec');
        // Fallback to a minimal spec
        openApiSpec = {
            openapi: "3.0.3",
            info: {
                title: "AI Prompt Enhancer API",
                version: "1.0.0",
                description: "API documentation not yet generated. Run 'npm run generate-docs' to create it."
            },
            paths: {}
        };
    }
} catch (error) {
    console.error('Error loading OpenAPI specification:', error.message);
    openApiSpec = {
        openapi: "3.0.3",
        info: {
            title: "AI Prompt Enhancer API",
            version: "1.0.0",
            description: "Error loading API documentation."
        },
        paths: {}
    };
}

// Swagger UI options
const swaggerUiOptions = {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
        docExpansion: 'list',
        filter: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
    }
};

// Mount Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, swaggerUiOptions));

// Static files for SEO optimization
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: 86400000 // 1 day in milliseconds
}));

// SEO routes with proper headers 
app.get('/robots.txt', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

app.get('/sitemap.xml', (req, res) => {
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

// Authentication routes (no auth required but rate limited)
app.use('/v1/auth', rateLimitMiddleware(), authRoutes);

// API routes with JWT auth and rate limiting
app.use('/v1/prompts', authenticateToken, rateLimitMiddleware(), promptRoutes);

app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes cache

    res.json({
        message: 'Welcome to the AI Prompt Enhancer API',
        version: '1.0.0',
        documentation: '/docs',
        description: 'Transform basic prompts into optimized, powerful instructions for AI models like ChatGPT, Claude, and Gemini.',
        features: [
            'Intelligent prompt enhancement',
            'Multi-AI provider support',
            'Open source and free to use',
            'Security-focused with JWT authentication',
            'Mobile-friendly responsive design'
        ],
        supportedModels: ['ChatGPT', 'Claude', 'Gemini', 'Mistral AI']
    });
});

app.get('/api-docs', (req, res) => {
    res.redirect('/docs');
});

app.get('/docs-json', (req, res) => {
    // Set cache headers for better performance
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour cache
    res.setHeader('Content-Type', 'application/json');
    res.json(openApiSpec);
});

// Enhanced health check endpoint with cache control
app.get('/health', (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');

    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'AI Prompt Enhancer API',
        version: '1.0.0',
        environment: process.env.NODE_ENV
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