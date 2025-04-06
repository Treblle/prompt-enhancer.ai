/**
 * Rate Limiting and Security Middleware
 * 
 * This module implements improved rate limiting and security headers
 * configuration for the Prompt Enhancer API 
 */
const Redis = require('redis');
const { RateLimiterRedis, RateLimiterMemory } = require('rate-limiter-flexible');
const helmet = require('helmet');
const compression = require('compression');

// Get whitelisted IPs from environment variable
const WHITELISTED_IPS = process.env.WHITELISTED_IPS
    ? process.env.WHITELISTED_IPS.split(',').map(ip => ip.trim())
    : [];

// Rate limiter instances
let generalLimiter;
let authLimiter;
let ipLimiter;

/**
 * Initialize rate limiters with Redis if available, otherwise use in-memory
 */
async function initializeRateLimiters() {
    // Try to connect to Redis if configured
    if (process.env.REDIS_URL) {
        try {
            const redisClient = Redis.createClient({
                url: process.env.REDIS_URL,
                socket: {
                    connectTimeout: 3000, // 3 seconds timeout
                }
            });

            // Connect to Redis
            await redisClient.connect();
            console.log('Connected to Redis successfully');

            // General rate limiter - all API requests
            generalLimiter = new RateLimiterRedis({
                storeClient: redisClient,
                keyPrefix: 'rl_general',
                points: parseInt(process.env.MAX_REQUESTS_PER_MINUTE, 10) || 100, // 100 requests
                duration: 60, // per minute
            });

            // Rate limiter for authentication endpoints
            authLimiter = new RateLimiterRedis({
                storeClient: redisClient,
                keyPrefix: 'rl_auth',
                points: 20, // 20 auth requests
                duration: 60, // per minute
                blockDuration: 300, // Block for 5 minutes if exceeded
            });

            // IP-based rate limiter for DDoS protection
            ipLimiter = new RateLimiterRedis({
                storeClient: redisClient,
                keyPrefix: 'rl_ip',
                points: parseInt(process.env.IP_MAX_REQUESTS_PER_MINUTE, 10) || 30, // 30 requests
                duration: 60, // per minute
                blockDuration: 300, // Block for 5 minutes if exceeded
            });

            return true;
        } catch (err) {
            console.error('Redis connection failed, falling back to memory-based rate limiting', err);
            setupMemoryRateLimiters();
            return false;
        }
    } else {
        console.log('Redis URL not provided, using in-memory rate limiting');
        setupMemoryRateLimiters();
        return true;
    }
}

/**
 * Set up in-memory rate limiters when Redis is not available
 */
function setupMemoryRateLimiters() {
    // General rate limiter - all API requests
    generalLimiter = new RateLimiterMemory({
        points: parseInt(process.env.MAX_REQUESTS_PER_MINUTE, 10) || 100, // 100 requests
        duration: 60, // per minute
    });

    // Rate limiter for authentication endpoints
    authLimiter = new RateLimiterMemory({
        points: 20, // 20 auth requests
        duration: 60, // per minute
        blockDuration: 300, // Block for 5 minutes if exceeded
    });

    // IP-based rate limiter for DDoS protection
    ipLimiter = new RateLimiterMemory({
        points: parseInt(process.env.IP_MAX_REQUESTS_PER_MINUTE, 10) || 30, // 30 requests
        duration: 60, // per minute
        blockDuration: 300, // Block for 5 minutes if exceeded
    });
}

/**
 * Enhanced security middleware configuration
 * @param {Object} app - Express app instance
 */
function applySecurityMiddleware(app) {
    // Enhanced security middleware with improved CSP
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
                imgSrc: ["'self'", "data:", "https://cdn.prod.website-files.com"],
                connectSrc: ["'self'", "https://*.prompt-enhancer.ai"],
                fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'none'"],
                formAction: ["'self'"],
                workerSrc: ["'self'"],
                manifestSrc: ["'self'"],
                baseUri: ["'self'"],
                frameAncestors: ["'none'"], // Critical for preventing clickjacking
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
}

/**
 * Rate limiting middleware - General purpose
 * @returns {Function} Express middleware
 */
function rateLimitMiddleware() {
    return async (req, res, next) => {
        try {
            // Check if client IP is whitelisted
            const clientIp = req.ip || req.connection.remoteAddress;
            const forwardedIp = req.header('X-Forwarded-For') ? req.header('X-Forwarded-For').split(',')[0].trim() : null;
            const isWhitelisted = WHITELISTED_IPS.includes(clientIp) ||
                (forwardedIp && WHITELISTED_IPS.includes(forwardedIp));

            // If IP is whitelisted, bypass rate limiting
            if (isWhitelisted) {
                // Add mock rate limit headers for consistency
                res.set('X-RateLimit-Limit', 100);
                res.set('X-RateLimit-Remaining', 100);
                res.set('X-RateLimit-Reset', Date.now() + 60000);
                return next();
            }

            // Skip in test environment if flag is set
            if (process.env.NODE_ENV === 'test' && process.env.SKIP_RATE_LIMIT === 'true') {
                // Add mock rate limit headers
                res.set('X-RateLimit-Limit', 100);
                res.set('X-RateLimit-Remaining', 99);
                res.set('X-RateLimit-Reset', Date.now() + 60000);
                return next();
            }

            // Use the appropriate limiter
            const limiter = isAuthRoute(req.path) ? authLimiter : generalLimiter;

            // Key for rate limiting (default: IP address)
            const key = clientIp || 'unknown-ip';

            try {
                const rateLimiterRes = await limiter.consume(key);

                // Set rate limit headers - this is critical for API Insights score
                res.set('X-RateLimit-Limit', limiter.points);
                res.set('X-RateLimit-Remaining', rateLimiterRes.remainingPoints);
                res.set('X-RateLimit-Reset', new Date(Date.now() + rateLimiterRes.msBeforeNext).getTime() / 1000);

                next();
            } catch (rateLimiterRes) {
                // Rate limit exceeded
                res.set('X-RateLimit-Limit', limiter.points);
                res.set('X-RateLimit-Remaining', 0);
                res.set('X-RateLimit-Reset', new Date(Date.now() + rateLimiterRes.msBeforeNext).getTime() / 1000);
                res.set('Retry-After', Math.ceil(rateLimiterRes.msBeforeNext / 1000));

                res.status(429).json({
                    error: {
                        code: 'rate_limit_exceeded',
                        message: 'Too many requests, please try again later',
                        details: {
                            retryAfter: Math.ceil(rateLimiterRes.msBeforeNext / 1000)
                        }
                    }
                });
            }
        } catch (error) {
            // In case of error, don't block the request
            console.error('Rate limiting error:', error);
            next();
        }
    };
}

/**
 * IP-based DDoS protection middleware
 * @returns {Function} Express middleware
 */
function ddosProtectionMiddleware() {
    return async (req, res, next) => {
        // Check if client IP is whitelisted
        const clientIp = req.ip || req.connection.remoteAddress;
        const forwardedIp = req.header('X-Forwarded-For') ? req.header('X-Forwarded-For').split(',')[0].trim() : null;
        const isWhitelisted = WHITELISTED_IPS.includes(clientIp) ||
            (forwardedIp && WHITELISTED_IPS.includes(forwardedIp));

        // If IP is whitelisted, bypass DDoS protection
        if (isWhitelisted) {
            return next();
        }

        // Skip in test environment
        if (process.env.NODE_ENV === 'test' && process.env.SKIP_RATE_LIMIT === 'true') {
            return next();
        }

        const key = clientIp || 'unknown-ip';

        try {
            await ipLimiter.consume(key, 1);
            next();
        } catch (rateLimiterRes) {
            res.status(429).json({
                error: {
                    code: 'too_many_requests',
                    message: 'Too many requests from this IP, please try again later',
                    details: {
                        retryAfter: Math.ceil(rateLimiterRes.msBeforeNext / 1000)
                    }
                }
            });
        }
    };
}

/**
 * Check if the current route is an authentication route
 * @param {string} path - Request path
 * @returns {boolean} True if it's an auth route
 */
function isAuthRoute(path) {
    return path.startsWith('/v1/auth') || path.startsWith('/auth');
}

/**
 * CDN detection middleware with caching headers
 * @returns {Function} Express middleware
 */
function cdnMiddleware() {
    return (req, res, next) => {
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
    };
}

/**
 * Apply comprehensive security headers to all responses
 * @returns {Function} Express middleware
 */
function securityHeadersMiddleware() {
    return (req, res, next) => {
        // Set X-Frame-Options to prevent clickjacking
        res.setHeader('X-Frame-Options', 'DENY');

        // Set X-Content-Type-Options to prevent MIME type sniffing
        res.setHeader('X-Content-Type-Options', 'nosniff');

        // Set Content-Security-Policy
        res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';");

        // Set Strict-Transport-Security for HTTPS enforcement
        res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains; preload');

        // Set X-XSS-Protection as an additional layer of protection
        res.setHeader('X-XSS-Protection', '1; mode=block');

        // Set Referrer-Policy to control how much information is sent
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

        next();
    };
}

module.exports = {
    initializeRateLimiters,
    applySecurityMiddleware,
    rateLimitMiddleware,
    ddosProtectionMiddleware,
    cdnMiddleware,
    securityHeadersMiddleware
};