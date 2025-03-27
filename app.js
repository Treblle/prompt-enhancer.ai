const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
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

// Add compression middleware
app.use(compression({
    // Compression filter: only compress responses with the following content types
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            // Don't compress responses if this request header is present
            return false;
        }
        // Compress all JSON and text responses
        return (
            /json|text|javascript|css|xml|svg/.test(res.getHeader('Content-Type'))
        );
    },
    // Compression level (0-9)
    level: 6
}));

// CDN Detection middleware
app.use((req, res, next) => {
    // Check for CDN-specific headers
    const isCdnRequest = req.headers['x-cdn-request'] === 'true' ||
        req.headers['x-forwarded-host']?.includes('cdn.prompt-enhancer.ai');

    if (isCdnRequest) {
        // Add appropriate cache headers for CDN
        res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minute cache
        res.setHeader('CDN-Cache-Control', 'public, max-age=300');

        // Add cache validation headers
        const now = new Date();
        res.setHeader('Last-Modified', now.toUTCString());

        // Flag this as a CDN request for other middlewares
        req.isCdnRequest = true;
    }

    next();
});

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
                : ['https://prompt-enhancer.ai', 'https://www.prompt-enhancer.ai', 'https://cdn.prompt-enhancer.ai']);

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-API-Key', 'Origin', 'Accept', 'Content-Encoding'],
    exposedHeaders: ['Content-Encoding', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
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

// Log some info about the loaded spec
if (openApiSpec && openApiSpec.paths) {
    const pathCount = Object.keys(openApiSpec.paths).length;
    console.log(`Loaded OpenAPI spec with ${pathCount} path(s)`);
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

// Add redirect from old /docs endpoint to the new Swagger UI
app.get('/api-docs', (req, res) => {
    res.redirect('/docs');
});

// Keep the original /docs endpoint for backward compatibility
// But also serve the full OpenAPI spec there
app.get('/docs-json', (req, res) => {
    res.json(openApiSpec);
});

app.get('/api-check', (req, res) => {
    // Enhanced api-check with more details for Treblle troubleshooting
    res.json({
        apiKeyConfigured: !!process.env.API_KEY,
        apiKeyFirstFour: process.env.API_KEY ? process.env.API_KEY.substring(0, 4) : null,
        openAIConfigured: !!process.env.OPENAI_API_KEY,
        nodeEnv: process.env.NODE_ENV,
        corsOrigins: process.env.CORS_ALLOWED_ORIGINS,
        compressionEnabled: true,
        cdnConfigured: true,
        swaggerUiEnabled: true,
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