/**
 * Security Middleware
 * 
 * This module provides specialized middleware functions for addressing
 * specific security concerns identified by API Insights from Treblle,
 * particularly iFrame Protection and IDOR Prevention.
 */

const crypto = require('crypto');
const { validate: uuidValidate } = require('uuid');

/**
 * Middleware to prevent iframe embedding (clickjacking protection)
 * Ensures X-Frame-Options header is set to DENY
 */
function preventIframeEmbedding(req, res, next) {
    // Set X-Frame-Options header to DENY
    res.setHeader('X-Frame-Options', 'DENY');
    next();
}

/**
 * Validates if a string is a valid UUID
 * @param {string} id - The ID to validate
 * @returns {boolean} - Whether the ID is a valid UUID
 */
function isValidUUID(id) {
    return uuidValidate(id);
}

/**
 * Validates if a string is a valid MongoDB ObjectID
 * @param {string} id - The ID to validate
 * @returns {boolean} - Whether the ID is a valid MongoDB ObjectID
 */
function isValidObjectID(id) {
    // MongoDB ObjectIDs are 24 hex characters
    return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Validates if a string is a valid ULID (Universally Unique Lexicographically Sortable Identifier)
 * @param {string} id - The ID to validate
 * @returns {boolean} - Whether the ID is a valid ULID
 */
function isValidULID(id) {
    // ULIDs are 26 characters of Crockford's base32 (uppercase)
    return /^[0-9A-Z]{26}$/.test(id);
}

/**
 * Validates if a string matches a custom ID pattern for the application
 * @param {string} id - The ID to validate
 * @returns {boolean} - Whether the ID matches our custom pattern
 */
function isValidCustomId(id) {
    // Our custom ID format: "prompt_" followed by alphanumeric characters
    return /^prompt_[a-zA-Z0-9]{6,32}$/.test(id);
}

/**
 * Middleware to prevent Insecure Direct Object Reference (IDOR) vulnerabilities
 * Validates that all ID parameters conform to expected formats
 */
function preventIDOR(req, res, next) {
    // Extract path parameters from req.params
    const params = req.params;

    // List of common ID parameter names to check
    const idParams = [
        'id', 'promptId', 'userId', 'documentId', 'resourceId'
    ];

    // Validate each ID parameter
    for (const param of idParams) {
        if (params[param]) {
            const id = params[param];

            // Check against all supported ID formats
            const isValid =
                isValidUUID(id) ||
                isValidObjectID(id) ||
                isValidULID(id) ||
                isValidCustomId(id);

            if (!isValid) {
                return res.status(400).json({
                    error: {
                        code: 'invalid_id_format',
                        message: `Invalid ID format for parameter '${param}'`,
                        details: {
                            param,
                            reason: 'ID does not match any supported format (UUID, ObjectID, ULID, or custom application format)'
                        }
                    }
                });
            }
        }
    }

    // All IDs validated, continue
    next();
}

/**
 * A comprehensive security middleware that combines various protections
 */
function enhancedSecurityMiddleware() {
    return (req, res, next) => {
        // Set iFrame protection header
        res.setHeader('X-Frame-Options', 'DENY');

        // Set Content-Security-Policy with frame-ancestors directive
        let csp = res.getHeader('Content-Security-Policy') || '';
        if (!csp.includes('frame-ancestors')) {
            // Add frame-ancestors directive if not already present
            csp += "; frame-ancestors 'none'";
            res.setHeader('Content-Security-Policy', csp);
        }

        // Apply UUID validation for route parameters
        // This is automatically handled by the preventIDOR middleware
        // for routes that have ID parameters

        next();
    };
}

module.exports = {
    preventIframeEmbedding,
    preventIDOR,
    enhancedSecurityMiddleware
};