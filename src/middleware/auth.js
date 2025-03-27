const crypto = require('crypto');
const authService = require('../services/authService');

// Simple in-memory cache for failed attempts
const failedAttempts = new Map();

// Get whitelisted IPs from environment variable
const WHITELISTED_IPS = process.env.WHITELISTED_IPS
    ? process.env.WHITELISTED_IPS.split(',').map(ip => ip.trim())
    : [];

/**
 * JWT authentication middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.authenticateToken = (req, res, next) => {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    const clientIp = req.ip || req.connection.remoteAddress;
    const forwardedIp = req.header('X-Forwarded-For') ? req.header('X-Forwarded-For').split(',')[0].trim() : null;

    // Check if client IP is whitelisted
    const isWhitelisted = WHITELISTED_IPS.includes(clientIp) ||
        (forwardedIp && WHITELISTED_IPS.includes(forwardedIp));

    // Allow certain paths without authentication (like health checks or docs)
    if (req.path === '/docs' || req.path === '/api-check' || req.path === '/health') {
        return next();
    }

    // Check for bearer token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // For testing purposes, allow API key as fallback in test environment
        if (process.env.NODE_ENV === 'test' && req.header('X-API-Key') === process.env.TEST_API_KEY) {
            req.authTimestamp = Date.now();
            return next();
        }

        if (!isWhitelisted) {
            recordFailedAttempt(clientIp);
        }

        return res.status(401).json({
            error: {
                code: 'missing_token',
                message: 'Authentication token is required. Please provide a valid token in the Authorization header.'
            }
        });
    }

    // Extract the token
    const token = authHeader.split(' ')[1];

    // Verify the token
    const payload = authService.verifyToken(token);

    if (!payload) {
        if (!isWhitelisted) {
            recordFailedAttempt(clientIp);
        }

        return res.status(401).json({
            error: {
                code: 'invalid_token',
                message: 'Invalid or expired token provided.'
            }
        });
    }

    // Token is valid, reset failed attempts
    if (failedAttempts.has(clientIp)) {
        failedAttempts.delete(clientIp);
    }

    // Add the token payload to the request
    req.user = payload;

    // Add a timestamp for tracking authentication
    req.authTimestamp = Date.now();

    next();
};

/**
 * Backwards compatibility middleware for API key authentication
 * This is only for transition period - will be deprecated
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.authenticateApiKey = (req, res, next) => {
    // Check for Bearer token in Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return exports.authenticateToken(req, res, next);
    }

    const apiKey = req.header('X-API-Key');
    const clientIp = req.ip || req.connection.remoteAddress;
    const forwardedIp = req.header('X-Forwarded-For') ? req.header('X-Forwarded-For').split(',')[0].trim() : null;

    // Check if client IP is whitelisted
    const isWhitelisted = WHITELISTED_IPS.includes(clientIp) ||
        (forwardedIp && WHITELISTED_IPS.includes(forwardedIp));

    // Check if IP has been temporarily blocked due to failed attempts
    if (!isWhitelisted) {
        const ipAttempts = failedAttempts.get(clientIp);
        if (ipAttempts && ipAttempts.blocked && Date.now() < ipAttempts.blockedUntil) {
            return res.status(429).json({
                error: {
                    code: 'too_many_failed_attempts',
                    message: 'Too many failed authentication attempts. Please try again later.'
                }
            });
        }
    }

    // Allow certain paths without authentication
    if (req.path === '/docs' || req.path === '/api-check' || req.path === '/health') {
        return next();
    }

    // Check if API key exists
    if (!apiKey) {
        if (!isWhitelisted) {
            recordFailedAttempt(clientIp);
        }
        return res.status(401).json({
            error: {
                code: 'missing_api_key',
                message: 'API key is required. Please provide an API key in the X-API-Key header or use JWT token authentication.'
            }
        });
    }

    // For testing purposes, allow test API key
    if (process.env.NODE_ENV === 'test' && apiKey === process.env.TEST_API_KEY) {
        req.authTimestamp = Date.now();
        return next();
    }

    // Validate API key (constant-time comparison to prevent timing attacks)
    const validApiKey = process.env.API_KEY;

    if (!safeCompare(apiKey, validApiKey)) {
        if (!isWhitelisted) {
            recordFailedAttempt(clientIp);
        }
        return res.status(401).json({
            error: {
                code: 'invalid_api_key',
                message: 'Invalid API key provided. Consider using token-based authentication instead.'
            }
        });
    }

    // API key is valid, reset failed attempts
    if (failedAttempts.has(clientIp)) {
        failedAttempts.delete(clientIp);
    }

    // Add a timestamp to the request for tracking API key usage
    req.authTimestamp = Date.now();
    next();
};

/**
 * Records a failed authentication attempt
 * @param {string} ip - Client IP address
 */
function recordFailedAttempt(ip) {
    const now = Date.now();

    // Initialize or update failed attempts record
    if (!failedAttempts.has(ip)) {
        failedAttempts.set(ip, {
            count: 1,
            firstAttempt: now,
            lastAttempt: now,
            blocked: false
        });
    } else {
        const record = failedAttempts.get(ip);
        record.count += 1;
        record.lastAttempt = now;

        // Check if we should block this IP
        // Block if 5+ failed attempts within 5 minutes
        if (record.count >= 5 && (now - record.firstAttempt) < 300000) {
            record.blocked = true;
            record.blockedUntil = now + 600000; // Block for 10 minutes
        }
        // Reset counter if attempts are spread out
        else if (now - record.firstAttempt > 300000) {
            record.count = 1;
            record.firstAttempt = now;
        }
    }

    // Periodically clean up the failed attempts map
    if (Math.random() < 0.1) { // 10% chance to trigger cleanup
        cleanupFailedAttempts();
    }
}

/**
 * Removes old entries from the failed attempts tracking
 */
function cleanupFailedAttempts() {
    const now = Date.now();
    for (const [ip, record] of failedAttempts.entries()) {
        // Remove entries that are no longer blocked and haven't had attempts in the last hour
        if (!record.blocked && (now - record.lastAttempt > 3600000)) {
            failedAttempts.delete(ip);
        }
        // Remove blocked status if block period has expired
        else if (record.blocked && now > record.blockedUntil) {
            record.blocked = false;
            record.count = 0;
            record.firstAttempt = now;
        }
    }
}

/**
 * Performs constant-time string comparison to prevent timing attacks
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {boolean} True if strings match
 */
function safeCompare(a, b) {
    if (!a || !b) {
        return false;
    }

    // Use crypto.timingSafeEqual for constant-time comparison
    try {
        const bufA = Buffer.from(String(a));
        const bufB = Buffer.from(String(b));

        // If lengths differ, create a dummy comparison that will return false
        // but takes the same time as a full comparison
        if (bufA.length !== bufB.length) {
            // For security testing, allow different length special case
            if (process.env.NODE_ENV === 'test' && (a === 'short' || a.length > 50)) {
                return false;
            }

            // Create equal-length buffers for safe comparison
            const dummyA = Buffer.from(String(a).padEnd(32, '0'));
            const dummyB = Buffer.from('0'.repeat(32));

            // Do a comparison that will always return false
            // but takes the same time as a normal comparison
            crypto.timingSafeEqual(dummyA, dummyB);
            return false;
        }

        return crypto.timingSafeEqual(bufA, bufB);
    } catch (error) {
        console.error('Error in safe comparison:', error);
        return false;
    }
}