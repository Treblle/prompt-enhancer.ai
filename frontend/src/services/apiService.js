// Import auth service for token management
import authService from './authService';

// Define API base URL based on environment
const API_BASE_URL = process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === 'development'
        ? 'http://localhost:5000/v1'
        : 'https://prompt-enhancer.ai/v1');

// Debug logging for API configuration (only in development)
if (process.env.NODE_ENV === 'development') {
    console.log('API Configuration:', {
        baseUrl: API_BASE_URL,
        environment: process.env.NODE_ENV
    });
}

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
    try {
        // Get the current authentication token
        let token = authService.getToken();

        // If no token exists, try to get one
        if (!token) {
            try {
                token = await authService.initializeAuth();
            } catch (authError) {
                throw new APIError('Authentication failed', 401, authError);
            }
        }

        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };

        console.log('Making API request to:', url);
        const response = await fetch(url, config);
        console.log('Response status:', response.status);

        // Handle 401 Unauthorized - token might be expired
        if (response.status === 401) {
            // Try to get a new token and retry the request
            try {
                console.log('Token expired, refreshing...');
                const newToken = await authService.fetchToken();

                // Update headers with new token
                config.headers['Authorization'] = `Bearer ${newToken}`;

                // Retry the request
                console.log('Retrying request with new token');
                const retryResponse = await fetch(url, config);

                // If retry also fails, throw an error
                if (!retryResponse.ok) {
                    throw new APIError(
                        'Authentication failed after token refresh',
                        retryResponse.status
                    );
                }

                // Parse and return retry response
                const contentType = retryResponse.headers.get('content-type');
                const isJsonResponse = contentType && contentType.includes('application/json');
                return isJsonResponse ? await retryResponse.json() : await retryResponse.text();
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                throw new APIError('Authentication failed', 401, refreshError);
            }
        }

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
     * @param {AbortSignal} [signal] - AbortController signal for timeout
     * @returns {Promise<Object>} Enhanced prompt response
     */
    enhancePrompt: async (data, signal) => {
        // Validate input
        if (!data.text || typeof data.text !== 'string') {
            throw new APIError('Invalid or missing original prompt', 400);
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
                body: JSON.stringify(requestData),
                signal // Pass the AbortController signal
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