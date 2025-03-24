/**
 * API Key Management Utility
 * Securely manages API keys without exposing them
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class KeyManager {
    constructor() {
        this.keys = {};
        this.keyInfo = {};
        this.initialized = false;
    }

    /**
     * Initialize API keys from environment variables
     * @returns {boolean} Success status
     */
    initialize() {
        try {
            // Initialize application API key
            this._initializeKey('api', process.env.API_KEY, {
                required: true,
                minLength: 8
            });

            // Initialize OpenAI API key if configured
            this._initializeKey('openai', process.env.OPENAI_API_KEY, {
                required: process.env.AI_PROVIDER === 'openai',
                prefix: 'sk-'
            });

            // Initialize Mistral API key if configured
            this._initializeKey('mistral', process.env.MISTRAL_API_KEY, {
                required: process.env.AI_PROVIDER === 'mistral'
            });

            this.initialized = true;
            return true;
        } catch (error) {
            console.error('Error initializing API keys:', error.message);
            return false;
        }
    }

    /**
     * Initialize and validate a specific key
     * @param {string} name - Key name
     * @param {string} value - Key value
     * @param {Object} options - Validation options
     * @private
     */
    _initializeKey(name, value, options = {}) {
        const { required = false, minLength = 8, prefix = null } = options;

        // Check if key is required but not provided or is a placeholder
        if (required && (!value || value.includes('your_') || value.includes('_here'))) {
            if (process.env.NODE_ENV === 'development') {
                console.warn(`⚠️  WARNING: ${name.toUpperCase()} key is required but not properly configured.`);
                console.warn(`   This will cause errors in production.`);

                // For development, continue but mark as unavailable
                this.keyInfo[name] = {
                    available: false,
                    masked: null,
                    placeholder: true
                };
                return;
            } else {
                throw new Error(`${name.toUpperCase()} key is required but not provided`);
            }
        }

        // Skip non-required keys that aren't provided
        if (!value || value.includes('your_') || value.includes('_here')) {
            this.keyInfo[name] = {
                available: false,
                masked: null,
                placeholder: true
            };
            return;
        }

        // Validate key length
        if (value.length < minLength) {
            throw new Error(`${name.toUpperCase()} key is too short (min ${minLength} characters)`);
        }

        // Validate key prefix if specified
        if (prefix && !value.startsWith(prefix)) {
            throw new Error(`${name.toUpperCase()} key must start with '${prefix}'`);
        }

        // Store key information
        this.keys[name] = value;
        this.keyInfo[name] = {
            available: true,
            masked: this._maskKey(value),
            hash: this._hashKey(value),
            placeholder: false
        };
    }

    /**
     * Get an API key
     * @param {string} name - Key name
     * @returns {string|null} API key or null if not available
     */
    getKey(name) {
        if (!this.initialized) {
            this.initialize();
        }

        return this.keys[name] || null;
    }

    /**
     * Check if a key is available
     * @param {string} name - Key name
     * @returns {boolean} True if key is available
     */
    isKeyAvailable(name) {
        if (!this.initialized) {
            this.initialize();
        }

        return this.keyInfo[name]?.available || false;
    }

    /**
     * Get masked version of key for logging
     * @param {string} name - Key name
     * @returns {string|null} Masked key or null if not available
     */
    getMaskedKey(name) {
        if (!this.initialized) {
            this.initialize();
        }

        return this.keyInfo[name]?.masked || null;
    }

    /**
     * Verify if a key matches the stored key
     * @param {string} name - Key name
     * @param {string} keyToVerify - Key to verify
     * @returns {boolean} True if key matches
     */
    verifyKey(name, keyToVerify) {
        if (!this.initialized) {
            this.initialize();
        }

        if (!this.keys[name] || !keyToVerify) {
            return false;
        }

        // Use constant-time comparison to prevent timing attacks
        try {
            const storedKey = Buffer.from(this.keys[name]);
            const providedKey = Buffer.from(keyToVerify);

            // If lengths differ, safely return false without timing information
            if (storedKey.length !== providedKey.length) {
                return false;
            }

            return crypto.timingSafeEqual(storedKey, providedKey);
        } catch (error) {
            console.error('Error verifying key:', error.message);
            return false;
        }
    }

    /**
     * Create a masked version of an API key for logging
     * @param {string} key - API key to mask
     * @returns {string} Masked key
     * @private
     */
    _maskKey(key) {
        if (!key) return null;

        // Show first 4 chars and last 4 chars
        const firstChars = key.substring(0, 4);
        const lastChars = key.substring(key.length - 4);

        // Replace middle with asterisks
        return `${firstChars}${'*'.repeat(Math.min(key.length - 8, 12))}${lastChars}`;
    }

    /**
     * Create a hash of an API key for comparison
     * @param {string} key - API key to hash
     * @returns {string} Hashed key
     * @private
     */
    _hashKey(key) {
        return crypto
            .createHash('sha256')
            .update(key)
            .digest('hex');
    }

    /**
     * Log API key status (safe for logging)
     * @returns {Object} Status object with masked keys
     */
    getStatus() {
        if (!this.initialized) {
            this.initialize();
        }

        const status = {};

        for (const [name, info] of Object.entries(this.keyInfo)) {
            status[name] = {
                available: info.available,
                masked: info.masked,
                placeholder: info.placeholder || false
            };
        }

        return status;
    }

    /**
     * Check environment configuration
     * Validates that all required keys are available
     * @returns {Object} Validation result with any errors
     */
    validateEnvironment() {
        if (!this.initialized) {
            this.initialize();
        }

        const errors = [];
        const warnings = [];
        const aiProvider = process.env.AI_PROVIDER || 'openai';

        // Check API key
        if (!this.isKeyAvailable('api')) {
            errors.push('API authentication key is missing or invalid');
        }

        // Check provider-specific keys
        if (aiProvider === 'openai' && !this.isKeyAvailable('openai')) {
            errors.push('OpenAI API key is required when using OpenAI provider');
        }

        if (aiProvider === 'mistral' && !this.isKeyAvailable('mistral')) {
            errors.push('Mistral API key is required when using Mistral provider');
        }

        // Return validation results
        return {
            valid: errors.length === 0,
            errors,
            warnings,
            provider: aiProvider
        };
    }
}

// Export singleton instance
module.exports = new KeyManager();