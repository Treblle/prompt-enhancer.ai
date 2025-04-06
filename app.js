const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const treblle = require('@treblle/express');
const { errorHandler } = require('./src/middleware/error');
const { authenticateToken, authenticateApiKey } = require('./src/middleware/auth');
const { rateLimit, ddosProtection } = require('./src/middleware/rate-limit');

const promptRoutes = require('./src/routes/prompts');
const authRoutes = require('./src/routes/auth');

const app = express();

// Enhanced security middleware with improved CSP
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https://cdn.prod.website-files.com"],
            connectSrc: ["'self'", "http://localhost:3000", "http://localhost:5000", "https://*.prompt-enhancer.ai"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
            formAction: ["'self'"],
            workerSrc: ["'self'"],
            manifestSrc: ["'self'"],
            baseUri: ["'self'"],
            frameAncestors: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    hsts: {
        maxAge: 15552000, // 180 days
        includeSubDomains: true,
        preload: true
    },
    noSniff: true,
    xssFilter: true,
    dnsPrefetchControl: { allow: false },
    permittedCrossDomainPolicies: { permittedPolicies: "none" },
    expectCt: {
        enforce: true,
        maxAge: 86400 // 1 day
    }
}));

// Add compression middleware - better configured for SEO
app.use(compression({
    // Compression filter: compress all responses
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            // Don't compress responses if this request header is present
            return false;
        }
        // Compress all JSON and text responses
        return (
            /json|text|javascript|css|xml|svg|html/.test(res.getHeader('Content-Type'))
        );
    },
    // Higher compression level for better performance
    level: 7
}));

// Advanced CDN Detection middleware with better caching
app.use((req, res, next) => {
    // Check for CDN-specific headers
    const isCdnRequest = req.headers['x-cdn-request'] === 'true' ||
        req.headers['x-forwarded-host']?.includes('cdn.prompt-enhancer.ai');

    if (isCdnRequest) {
        // Add appropriate cache headers for CDN
        const cacheTime = req.path === '/' ? 300 : 86400; // 5 mins for homepage, 24 hours for static
        res.setHeader('Cache-Control', `public, max-age=${cacheTime}`);
        res.setHeader('CDN-Cache-Control', `public, max-age=${cacheTime}`);

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
app.use(ddosProtection());

// Apply rate limiting to all API routes
const apiLimiter = rateLimit({
    maxRequests: 100, // 100 requests
    windowMs: 60 * 1000 // per minute
});

app.get('/robots.txt', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

app.get('/sitemap.xml', (req, res) => {
    res.header('Content-Type', 'application/xml');
    res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

// Improved OpenAPI spec loading with informative messages
function loadOpenApiSpec() {
    try {
        // Try the public directory first (where generate-docs puts it)
        const publicOpenApiPath = path.join(__dirname, 'public', 'openapi.json');
        const rootOpenApiPath = path.join(__dirname, 'openapi.json');
        const yamlPath = path.join(__dirname, 'openapi.yaml');

        if (fs.existsSync(publicOpenApiPath)) {
            console.log('Loading OpenAPI specification from public directory');
            return JSON.parse(fs.readFileSync(publicOpenApiPath, 'utf8'));
        } else if (fs.existsSync(rootOpenApiPath)) {
            console.log('Loading OpenAPI specification from root directory');
            return JSON.parse(fs.readFileSync(rootOpenApiPath, 'utf8'));
        } else {
            if (fs.existsSync(yamlPath)) {
                console.warn('OpenAPI specification file found as YAML but not converted to JSON.');
                console.warn('Run "npm run generate-docs" to generate the OpenAPI JSON file.');
            } else {
                console.warn('OpenAPI specification file not found, will use empty spec.');
                console.warn('Make sure openapi.yaml exists at the project root or run "npm run generate-docs".');
            }

            // Fallback to a minimal spec
            return {
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
        return {
            openapi: "3.0.3",
            info: {
                title: "AI Prompt Enhancer API",
                version: "1.0.0",
                description: "Error loading API documentation."
            },
            paths: {}
        };
    }
}

// Load OpenAPI specification
const openApiSpec = loadOpenApiSpec();

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

// Authentication routes (no auth required)
app.use('/v1/auth', apiLimiter, authRoutes);

// API routes with JWT auth
app.use('/v1/prompts', authenticateToken, apiLimiter, promptRoutes);

app.get('/', (req, res) => {
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
    res.json(openApiSpec);
});

// Improved api-check with security in mind (minimal exposure)
app.get('/api-check', (req, res) => {
    // Don't expose actual keys, just confirmation
    const apiKey = process.env.API_KEY;

    // Only return minimal info needed for debugging
    res.json({
        apiKeyConfigured: !!apiKey,
        apiKeyLength: apiKey ? apiKey.length : null,
        openAIConfigured: !!process.env.OPENAI_API_KEY,
        nodeEnv: process.env.NODE_ENV,
        corsOrigins: Array.isArray(config.cors.origins) ?
            config.cors.origins.map(origin => origin.replace(/^https?:\/\//, '')) :
            'Not configured',
        compressionEnabled: true,
        cdnConfigured: true,
        swaggerUiEnabled: true,
        treblleConfigured: process.env.NODE_ENV === 'production'
            ? {
                apiKeyConfigured: !!process.env.TREBLLE_API_KEY,
                projectIdConfigured: !!process.env.TREBLLE_PROJECT_ID
            }
            : 'Disabled in non-production'
    });
});

app.get('/health', (req, res) => {
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