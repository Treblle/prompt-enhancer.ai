const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Get the JWT secret from environment variables or generate a secure one
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h'; // Default 24 hour expiry

/**
 * Generate a JWT token for client use
 * @param {Object} payload - Data to include in the token
 * @returns {string} JWT token
 */
function generateToken(payload = {}) {
    // Add standard claims
    const tokenPayload = {
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        type: 'access'
    };

    // Sign and return the token
    return jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Token payload if valid, null if invalid
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return null;
    }
}

/**
 * Generate a client token for frontend use
 * This is generated at build time and doesn't contain sensitive information
 * @returns {string} Client token
 */
function generateClientToken() {
    return generateToken({
        clientId: crypto.randomUUID(),
        scope: 'api:access'
    });
}

/**
 * Hash a value using SHA-256
 * @param {string} value - Value to hash
 * @returns {string} Hashed value
 */
function hashValue(value) {
    return crypto
        .createHash('sha256')
        .update(value)
        .digest('hex');
}

module.exports = {
    generateToken,
    verifyToken,
    generateClientToken,
    hashValue
};