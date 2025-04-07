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

function isAuthError(error) {
    return (
        error.code === 'AUTH_ERROR' ||
        error.statusCode === 401 ||
        error.statusCode === 403 ||
        (error.message && (
            error.message.includes('authentication failed') ||
            error.message.includes('unauthorized') ||
            (error.message.includes('token') && (
                error.message.includes('invalid') ||
                error.message.includes('expired')
            ))
        ))
    );
}

// Utility function for logging
function logApiError(context, error) {
    console.error(`[API Service] ${context}`, {
        message: error.message,
        name: error.name,
        stack: error.stack,
        type: typeof error
    });
}

// Base fetch wrapper with enhanced error handling
async function apiFetch(url, options = {}) {
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
        attempts++;
        try {
            // Get the current authentication token and API key
            const token = await authService.initializeAuth();
            const apiKey = authService.getApiKey();

            if (!token) {
                console.error('Failed to get authentication token');
                throw new Error('Authentication failed - no token available');
            }

            const defaultHeaders = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-API-Key': apiKey
            };

            const config = {
                method: options.method || 'POST',
                ...options,
                headers: {
                    ...defaultHeaders,
                    ...options.headers
                }
            };

            // Ensure body is stringified if it's an object
            if (config.body && typeof config.body !== 'string') {
                config.body = JSON.stringify(config.body);
            }

            console.log('Making API request to:', url);

            // Add timeout to fetch
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout

            try {
                const response = await fetch(url, {
                    ...config,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);
                console.log('Response status:', response.status);

                // Handle non-200 status codes
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Error response text:', errorText);

                    // If unauthorized, try to refresh token
                    if (response.status === 401) {
                        if (attempts < maxAttempts) {
                            console.log('Unauthorized, refreshing token and retrying...');
                            authService.removeToken(); // Clear invalid token
                            continue; // Retry with fresh token
                        } else {
                            throw new Error('Authentication failed after retry');
                        }
                    }

                    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
                }

                // Parse response body
                const contentType = response.headers.get('content-type');
                const isJsonResponse = contentType && contentType.includes('application/json');

                const responseData = isJsonResponse
                    ? await response.json()
                    : await response.text();

                return responseData;
            } catch (fetchError) {
                // Clear timeout to prevent memory leaks
                clearTimeout(timeoutId);

                if (fetchError.name === 'AbortError') {
                    throw new Error('Request timed out after 45 seconds');
                }

                throw fetchError;
            }
        } catch (error) {
            // If this is our last attempt, or error isn't auth-related, throw
            if (attempts >= maxAttempts || !isAuthError(error)) {
                throw error;
            }

            // Wait before retrying auth-related errors
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
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
            throw new Error('Invalid or missing original prompt');
        }

        // Prepare request data
        const requestData = {
            text: data.text,
            format: data.format || 'structured'
        };

        try {
            console.log('Sending prompt enhancement request:', requestData);

            // Specific timeout for enhancePrompt requests
            const response = await apiFetch(`${API_BASE_URL}/prompts`, {
                method: 'POST',
                body: requestData
            });

            console.log('Prompt enhancement response received');
            return response;
        } catch (error) {
            logApiError('Prompt Enhancement Error', error);

            // More specific error message
            if (error.message.includes('timeout')) {
                throw new Error('The server took too long to respond. Your prompt might be too complex or the system is experiencing high load.');
            } else if (error.message.includes('401')) {
                throw new Error('Authentication failed. Please refresh the page or contact support if the issue persists.');
            } else {
                throw new Error(error.message || 'Failed to enhance prompt. Please check your input and try again.');
            }
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

            return await apiFetch(url.toString(), { method: 'GET' });
        } catch (error) {
            logApiError('Get Prompts Error', error);
            throw error;
        }
    }
};

export default apiService;