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
        // In a real implementation, you would validate client credentials here
        // For this simplified example, we're generating a token with minimal validation

        // For security, we should verify client credentials against a database
        // Here's a simplified check using an API key from the environment
        const { clientId, clientSecret } = req.body;
        const apiKey = process.env.API_KEY;

        // For backward compatibility, allow REACT_APP_API_KEY as fallback
        const validApiKey = process.env.API_KEY;

        if (!clientSecret || authService.hashValue(clientSecret) !== authService.hashValue(validApiKey)) {
            return res.status(401).json({
                error: {
                    code: 'invalid_credentials',
                    message: 'Invalid client credentials'
                }
            });
        }

        // Generate a token for the client
        const token = authService.generateToken({
            clientId: clientId || 'frontend-client',
            scope: 'api:access'
        });

        // Return the token
        res.json({
            access_token: token,
            token_type: 'Bearer',
            expires_in: 86400, // 24 hours in seconds
            scope: 'api:access'
        });
    } catch (error) {
        console.error('Token generation error:', error);
        res.status(500).json({
            error: {
                code: 'token_generation_failed',
                message: 'Failed to generate token'
            }
        });
    }
});

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
            return res.status(400).json({
                error: {
                    code: 'missing_token',
                    message: 'Token is required'
                }
            });
        }

        // Verify the token
        const payload = authService.verifyToken(token);

        if (!payload) {
            return res.status(401).json({
                error: {
                    code: 'invalid_token',
                    message: 'Invalid or expired token'
                }
            });
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
        res.status(500).json({
            error: {
                code: 'token_validation_failed',
                message: 'Failed to validate token'
            }
        });
    }
});

module.exports = router;