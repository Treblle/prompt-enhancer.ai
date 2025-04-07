// src/middleware/auth.js - Fixed version

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const authService = require('../services/authService');

// Simple in-memory cache for failed attempts
const failedAttempts = new Map();

// Get whitelisted IPs from environment variable
const WHITELISTED_IPS = process.env.WHITELISTED_IPS
    ? process.env.WHITELISTED_IPS.split(',').map(ip => ip.trim())
    : [];

/**
 * Sanitizes request data for logging to avoid exposing sensitive information
 * @param {Object} req - Express request object
 * @returns {Object} Sanitized data safe for logging
 */
function sanitizeRequestData(req) {
    // Create a safe copy of headers with sensitive data redacted
    const sanitizedHeaders = {};
    if (req.headers) {
        // Only include necessary headers and redact sensitive ones
        const safeHeaders = [
            'host',
            'user-agent',
            'content-type',
            'accept',
            'origin',
            'referer'
        ];

        for (const header of safeHeaders) {
            if (req.headers[header]) {
                sanitizedHeaders[header] = req.headers[header];
            }
        }

        // Always redact authorization headers, but indicate their presence
        if (req.headers.authorization) {
            sanitizedHeaders.authorization = '[REDACTED]';
        }

        if (req.headers['x-api-key']) {
            sanitizedHeaders['x-api-key'] = '[REDACTED]';
        }
    }

    // Sanitize body data - only include non-sensitive fields
    const sanitizedBody = {};
    if (req.body) {
        // For authentication requests, don't log credentials
        if (req.path && req.path.includes('/auth')) {
            if (req.body.clientId) {
                sanitizedBody.clientId = req.body.clientId;
            }
            // Don't include clientSecret or tokens
            if (req.body.clientSecret) {
                sanitizedBody.clientSecret = '[REDACTED]';
            }
        } else {
            // For prompt enhancement, only log text length, not content
            if (typeof req.body.text === 'string') {
                sanitizedBody.textLength = req.body.text.length;
                // Log first 20 chars of prompt text with ellipsis
                sanitizedBody.textPreview = req.body.text.substring(0, 20) +
                    (req.body.text.length > 20 ? '...' : '');
            }

            // Copy safe fields
            if (req.body.format) {
                sanitizedBody.format = req.body.format;
            }
        }
    }

    return {
        path: req.path,
        method: req.method,
        ip: req.ip,
        headers: sanitizedHeaders,
        body: sanitizedBody
    };
}

/**
 * JWT authentication middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.authenticateToken = (req, res, next) => {
    // Use the sanitizeRequestData function here
    console.log('Authentication middleware called', sanitizeRequestData(req));

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        console.error('No token provided');
        return res.status(401).json({
            error: {
                code: 'missing_token',
                message: 'Authentication token is required'
            }
        });
    }

    try {
        const decoded = authService.verifyToken(token);
        if (!decoded) {
            console.error('Token invalid or expired');
            return res.status(403).json({
                error: {
                    code: 'invalid_token',
                    message: 'Authentication token is invalid or expired'
                }
            });
        }

        console.log('Token decoded successfully:', {
            clientId: decoded.clientId,
            scope: decoded.scope,
            type: decoded.type,
            exp: new Date(decoded.exp * 1000).toISOString()
        });

        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token verification failed:', {
            error: error.message,
            token: '[REDACTED]'
        });
        return res.status(403).json({
            error: {
                code: 'token_verification_failed',
                message: 'Authentication failed'
            }
        });
    }
};

/**
 * Backwards compatibility middleware for API key authentication
 * This is only for transition period - will be deprecated
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.authenticateApiKey = (req, res, next) => {
    // Use the sanitizeRequestData function here too
    console.log('API Key authentication attempt', sanitizeRequestData(req));

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

    // Allow certain paths without authentication
    if (req.path === '/docs' || req.path === '/api-check' || req.path === '/health' || req.path === '/v1/auth/token') {
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

    // Validate API key (constant-time comparison to prevent timing attacks)
    const validApiKey = process.env.API_KEY;

    if (!safeCompare(apiKey, validApiKey)) {
        if (!isWhitelisted) {
            recordFailedAttempt(clientIp);
        }
        return res.status(401).json({
            error: {
                code: 'invalid_api_key',
                message: 'Invalid API key provided.'
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
            return false;
        }

        return crypto.timingSafeEqual(bufA, bufB);
    } catch (error) {
        console.error('Error in safe comparison:', error);
        return false;
    }
}

// Export the sanitize function so it can be used elsewhere
exports.sanitizeRequestData = sanitizeRequestData;