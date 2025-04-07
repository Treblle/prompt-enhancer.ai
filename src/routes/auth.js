const express = require('express');
const authService = require('../services/authService');
const router = express.Router();

/**
 * Generate a client token for frontend use
 * @route POST /v1/auth/token
 * @group Authentication - Operations about authentication
 * @param {object} req.body - Client credentials
 * @returns {object} 200 - Success response with token
 * @returns {Error} 400 - Bad request
 * @returns {Error} 401 - Unauthorized
 */
router.post('/token', (req, res) => {
    try {
        console.log('Token request received', {
            clientId: req.body.clientId || 'not-provided',
            headers: {
                contentType: req.headers['content-type'],
                apiKey: req.headers['x-api-key'] ? 'Provided' : 'Not provided'
            }
        });

        // For security, verify client credentials
        const { clientId, clientSecret } = req.body;

        // Get API key from env
        const validApiKey = process.env.API_KEY;

        if (!clientSecret) {
            console.error('Token request missing client secret');
            return res.status(400).json(
                createAuthError('missing_credentials', 'Client secret is required')
            );
        }

        // Verify API key
        if (clientSecret !== validApiKey) {
            console.error('Invalid client secret provided');
            return res.status(401).json(
                createAuthError('invalid_credentials', 'Invalid client credentials')
            );
        }

        // Generate a token for the client
        const token = authService.generateToken({
            clientId: clientId || 'frontend-client',
            scope: 'api:access'
        });

        console.log('Token generated successfully');

        // Return the token
        res.json({
            access_token: token,
            token_type: 'Bearer',
            expires_in: 86400, // 24 hours in seconds
            scope: 'api:access'
        });
    } catch (error) {
        console.error('Token generation error:', error);
        res.status(500).json(
            createAuthError('token_generation_failed', 'Failed to generate token')
        );
    }
});

/**
 * Generate a standardized authentication error response
 * @param {string} code - Error code 
 * @param {string} message - User-friendly error message
 * @param {Object} details - Optional additional details
 * @returns {Object} Standardized error response object
 */
function createAuthError(code, message, details = null) {
    const response = {
        error: {
            code,
            message
        }
    };

    if (details) {
        response.error.details = details;
    }

    return response;
}

/**
 * Validate token endpoint
 * @route POST /v1/auth/validate
 * @group Authentication - Operations about authentication
 * @param {object} req.body - Token to validate
 * @returns {object} 200 - Success response with token info
 * @returns {Error} 400 - Bad request
 * @returns {Error} 401 - Unauthorized
 */
router.post('/validate', (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json(
                createAuthError('missing_token', 'Token is required')
            );
        }

        // Verify the token
        const payload = authService.verifyToken(token);

        if (!payload) {
            return res.status(401).json(
                createAuthError('invalid_token', 'Invalid or expired token')
            );
        }

        // Return token info
        res.json({
            valid: true,
            clientId: payload.clientId,
            scope: payload.scope,
            expires: new Date(payload.exp * 1000).toISOString()
        });
    } catch (error) {
        console.error('Token validation error:', error);
        res.status(500).json(
            createAuthError('token_validation_failed', 'Failed to validate token')
        );
    }
});

module.exports = router;