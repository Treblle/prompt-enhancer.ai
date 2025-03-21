const Redis = require('redis');
const { RateLimiterRedis, RateLimiterMemory } = require('rate-limiter-flexible');

// Try to create Redis client, fall back to memory if Redis is not available
let redisClient;
let rateLimiterRedis;
let ipRateLimiter;
let apiKeyRateLimiter;

try {
    // Try to connect to Redis if configured
    if (process.env.REDIS_URL) {
        redisClient = Redis.createClient({
            url: process.env.REDIS_URL,
            socket: {
                connectTimeout: 3000, // 3 seconds timeout
            }
        });

        // Handle Redis errors
        redisClient.on('error', (err) => {
            console.error('Redis error:', err);
        });

        // Connect to Redis
        (async () => {
            try {
                await redisClient.connect();
                console.log('Connected to Redis successfully');

                // Initialize Redis rate limiters after successful connection
                rateLimiterRedis = new RateLimiterRedis({
                    storeClient: redisClient,
                    keyPrefix: 'rl_api',
                    points: 60, // 60 requests
                    duration: 60, // per minute
                });

                // Stricter rate limit for IP-based requests (DDoS protection)
                ipRateLimiter = new RateLimiterRedis({
                    storeClient: redisClient,
                    keyPrefix: 'rl_ip',
                    points: 30, // 30 requests 
                    duration: 60, // per minute
                    blockDuration: 300, // Block for 5 minutes if exceeded
                });

                // More lenient rate limit for API key requests
                apiKeyRateLimiter = new RateLimiterRedis({
                    storeClient: redisClient,
                    keyPrefix: 'rl_apikey',
                    points: 100, // 100 requests
                    duration: 60, // per minute
                });
            } catch (err) {
                console.error('Redis connection failed:', err);
                setupMemoryRateLimiters();
            }
        })();
    } else {
        console.log('Redis URL not provided, using in-memory rate limiting');
        setupMemoryRateLimiters();
    }
} catch (err) {
    console.error('Rate limiter initialization error:', err);
    setupMemoryRateLimiters();
}

// Setup in-memory rate limiters if Redis is not available
function setupMemoryRateLimiters() {
    // Fall back to in-memory rate limiter if Redis isn't available
    rateLimiterRedis = new RateLimiterMemory({
        points: 60, // 60 requests
        duration: 60, // per minute
    });

    // IP-based rate limiter for DDoS protection
    ipRateLimiter = new RateLimiterMemory({
        points: 30, // 30 requests 
        duration: 60, // per minute
        blockDuration: 300, // Block for 5 minutes if exceeded
    });

    // API key rate limiter
    apiKeyRateLimiter = new RateLimiterMemory({
        points: 100, // 100 requests
        duration: 60, // per minute
    });
}

/**
 * Rate limiting middleware
 * @param {Object} options - Rate limiting options
 * @param {number} options.maxRequests - Maximum requests allowed within the window
 * @param {number} options.windowMs - Time window in milliseconds
 * @returns {Function} Express middleware function
 */
exports.rateLimit = (options = {}) => {
    const { maxRequests = 60, windowMs = 60000 } = options; // Default: 60 requests per minute

    return async (req, res, next) => {
        const apiKey = req.header('X-API-Key');
        const ip = req.ip || req.connection.remoteAddress;

        // Apply both IP-based and API key-based rate limiting for layered protection
        try {
            // Always apply IP-based rate limiting first (DDoS protection)
            await ipRateLimiter.consume(ip);

            // If an API key is provided, use API key rate limiter
            if (apiKey) {
                await apiKeyRateLimiter.consume(apiKey);
            } else {
                // For requests without API key, use the general rate limiter
                await rateLimiterRedis.consume(ip);
            }

            // Continue to the next middleware if rate limits are not exceeded
            next();
        } catch (rejRes) {
            // Rate limit exceeded
            const resetInSeconds = Math.ceil(rejRes.msBeforeNext / 1000) || 60;

            // Set rate limit headers
            res.set({
                'X-RateLimit-Limit': maxRequests,
                'X-RateLimit-Remaining': 0,
                'X-RateLimit-Reset': Math.ceil(Date.now() / 1000) + resetInSeconds,
                'Retry-After': resetInSeconds
            });

            // Return rate limit exceeded error
            return res.status(429).json({
                error: {
                    code: 'rate_limit_exceeded',
                    message: `Rate limit exceeded. Try again in ${resetInSeconds} seconds.`
                }
            });
        }
    };
};

/**
 * Additional DDoS protection middleware
 * Checks for suspicious request patterns
 */
exports.ddosProtection = () => {
    const suspiciousIPs = new Map(); // Track potentially malicious IPs

    return (req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress;
        const now = Date.now();

        // Track request timing for each IP
        if (!suspiciousIPs.has(ip)) {
            suspiciousIPs.set(ip, {
                requestCount: 1,
                lastRequest: now,
                blocked: false,
                blockedUntil: 0
            });
        } else {
            const ipData = suspiciousIPs.get(ip);

            // If this IP is blocked, reject the request
            if (ipData.blocked && now < ipData.blockedUntil) {
                return res.status(429).json({
                    error: {
                        code: 'suspicious_activity',
                        message: 'Too many requests. Please try again later.'
                    }
                });
            } else if (ipData.blocked && now >= ipData.blockedUntil) {
                // Unblock if the block period has expired
                ipData.blocked = false;
            }

            // Calculate time since last request
            const timeSinceLastRequest = now - ipData.lastRequest;

            // Detect suspiciously rapid requests (potentially automated attacks)
            // This detects if there are a lot of requests coming in very rapid succession
            if (timeSinceLastRequest < 50) { // Less than 50ms between requests
                ipData.requestCount++;

                // If there are multiple rapid requests, block the IP temporarily
                if (ipData.requestCount > 10) {
                    ipData.blocked = true;
                    ipData.blockedUntil = now + 300000; // Block for 5 minutes

                    return res.status(429).json({
                        error: {
                            code: 'suspicious_activity',
                            message: 'Suspicious activity detected. Please try again later.'
                        }
                    });
                }
            } else {
                // Reset the counter if requests are not rapid
                if (timeSinceLastRequest > 1000) { // More than 1 second between requests
                    ipData.requestCount = 1;
                }
            }

            ipData.lastRequest = now;
        }

        // Clean up older entries periodically
        if (Math.random() < 0.01) { // 1% chance on each request to trigger cleanup
            const fifteenMinutesAgo = now - 900000;
            for (const [key, value] of suspiciousIPs.entries()) {
                if (value.lastRequest < fifteenMinutesAgo && !value.blocked) {
                    suspiciousIPs.delete(key);
                }
            }
        }

        next();
    };
};

// Clean up every hour
setInterval(() => {
    const now = Date.now();
    const oneHourAgo = now - 3600000;

    // This is a simple cleanup for the in-memory backup rate limiter
    const requestCounts = new Map();
    for (const [key, value] of requestCounts.entries()) {
        if (value.resetAt < oneHourAgo) {
            requestCounts.delete(key);
        }
    }
}, 3600000);