// Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === 'development'
        ? 'http://localhost:5001/v1'
        : 'https://prompt-enhancer.ai/v1');

const API_KEY = process.env.REACT_APP_API_KEY;

// Debug logging for API configuration
console.log('API Configuration:', {
    baseUrl: API_BASE_URL,
    apiKeyAvailable: !!API_KEY,
    apiKeyPrefix: API_KEY ? API_KEY.substring(0, 4) : 'Not set'
});

// Utility function for logging
function logApiError(context, error) {
    console.error(`[API Service] ${context}`, {
        message: error.message,
        stack: error.stack
    });
}

// Custom error class for API errors
class APIError extends Error {
    constructor(message, statusCode, details = {}) {
        super(message);
        this.name = 'APIError';
        this.statusCode = statusCode;
        this.details = details;
    }
}

// Base fetch wrapper with enhanced error handling
async function apiFetch(url, options = {}) {
    if (!API_KEY) {
        console.error('API Key is not configured! Check your .env or .env.development file.');
        throw new APIError('API Key is not configured', 500);
    }

    const defaultHeaders = {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };

    try {
        console.log('Making API request to:', url);
        const response = await fetch(url, config);
        console.log('Response status:', response.status);

        // Parse response body
        const contentType = response.headers.get('content-type');
        const isJsonResponse = contentType && contentType.includes('application/json');

        const responseData = isJsonResponse ? await response.json() : await response.text();
        console.log('Response data:', responseData);

        if (!response.ok) {
            // Construct detailed error
            throw new APIError(
                responseData.error?.message || 'Unknown API error',
                response.status,
                responseData
            );
        }

        return responseData;
    } catch (error) {
        console.error('Full error details:', error);
        logApiError('API Fetch Error', error);

        if (error instanceof APIError) {
            throw error;
        }

        // Generic network or parsing error
        throw new APIError(
            error.message || 'Network error occurred',
            error instanceof TypeError ? 500 : (error.statusCode || 500)
        );
    }
}

// API Service
const apiService = {
    /**
     * Enhance a prompt
     * @param {Object} data - Request data
     * @param {string} data.text - Original prompt text
     * @param {string} [data.format='structured'] - Desired format
     * @returns {Promise<Object>} Enhanced prompt response
     */
    enhancePrompt: async (data) => {
        // Validate input
        if (!data.text || typeof data.text !== 'string') {
            throw new APIError('Invalid prompt text', 400);
        }

        // Default format
        const requestData = {
            text: data.text,
            format: data.format || 'structured'
        };

        try {
            console.log('Sending prompt enhancement request:', requestData);

            const response = await apiFetch(`${API_BASE_URL}/prompts`, {
                method: 'POST',
                body: JSON.stringify(requestData)
            });

            console.log('Prompt enhancement response:', response);
            return response;
        } catch (error) {
            // Enhanced error logging
            logApiError('Prompt Enhancement Error', error);

            // Detailed error message
            throw new Error(
                error.message || 'Failed to enhance prompt. Please check your input and try again.'
            );
        }
    },

    /**
     * Gets a list of previously enhanced prompts
     * @param {number} [limit=10] - Maximum number of results
     * @param {number} [offset=0] - Pagination offset
     * @returns {Promise<Object>} Prompts list response
     */
    getPrompts: async (limit = 10, offset = 0) => {
        try {
            const url = new URL(`${API_BASE_URL}/prompts`);
            url.searchParams.append('limit', limit);
            url.searchParams.append('offset', offset);

            return await apiFetch(url.toString());
        } catch (error) {
            logApiError('Get Prompts Error', error);
            throw error;
        }
    }
};

export default apiService;