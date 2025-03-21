const fetch = require('node-fetch');

// Mistral AI API Configuration
const MISTRAL_API_URL = 'https://api.mistral.ai/v1';

/**
 * Mistral AI Service
 * Direct implementation using node-fetch to avoid dependencies on unofficial SDKs
 */
class MistralService {
    constructor(apiKey) {
        this.apiKey = apiKey;

        if (!this.apiKey) {
            throw new Error('Mistral API Key is required');
        }
    }

    /**
     * Make a request to the Mistral API
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise<Object>} Response data
     * @private
     */
    async _request(endpoint, options = {}) {
        const url = `${MISTRAL_API_URL}/${endpoint}`;

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
        };

        const config = {
            ...options,
            headers: {
                ...headers,
                ...options.headers
            },
            timeout: 30000 // 30 second timeout
        };

        try {
            const response = await fetch(url, config);

            // Check if the response is OK
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { error: { message: await response.text() } };
                }

                const error = new Error(
                    errorData.error?.message || `Mistral API Error: ${response.status} ${response.statusText}`
                );
                error.status = response.status;
                error.data = errorData;
                throw error;
            }

            return await response.json();
        } catch (error) {
            // Add request context to the error
            if (!error.status) {
                error.message = `Network Error: ${error.message}`;
            }
            console.error(`Mistral API Error (${endpoint}):`, error.message);
            throw error;
        }
    }

    /**
     * Get list of available models
     * @returns {Promise<Object>} List of models
     */
    async listModels() {
        return this._request('models');
    }

    /**
     * Generate text completions using Mistral AI
     * @param {Object} params - Completion parameters
     * @param {string} params.model - Model name (e.g., 'mistral-tiny', 'mistral-small', 'mistral-medium')
     * @param {Array<Object>} params.messages - Chat messages
     * @param {number} [params.temperature=0.7] - Temperature for sampling
     * @param {number} [params.maxTokens=800] - Maximum number of tokens to generate
     * @param {boolean} [params.stream=false] - Whether to stream the response
     * @returns {Promise<Object>} Completion response
     */
    async createChatCompletion(params) {
        const { model, messages, temperature = 0.7, maxTokens = 800, stream = false } = params;

        // Validate required parameters
        if (!model) throw new Error('Model parameter is required');
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            throw new Error('Messages parameter must be a non-empty array');
        }

        // Format request body according to Mistral API
        const requestBody = {
            model,
            messages,
            temperature,
            max_tokens: maxTokens,
            stream
        };

        return this._request('chat/completions', {
            method: 'POST',
            body: JSON.stringify(requestBody)
        });
    }

    /**
     * Generate embeddings for a text
     * @param {Object} params - Embedding parameters
     * @param {string} params.model - Model name (e.g., 'mistral-embed')
     * @param {string|Array<string>} params.input - Text(s) to embed
     * @returns {Promise<Object>} Embedding response
     */
    async createEmbedding(params) {
        const { model, input } = params;

        // Validate required parameters
        if (!model) throw new Error('Model parameter is required');
        if (!input) throw new Error('Input parameter is required');

        const requestBody = {
            model,
            input: Array.isArray(input) ? input : [input]
        };

        return this._request('embeddings', {
            method: 'POST',
            body: JSON.stringify(requestBody)
        });
    }
}

/**
 * Create and export a singleton instance
 */
const mistralService = new MistralService(process.env.MISTRAL_API_KEY);

module.exports = mistralService;