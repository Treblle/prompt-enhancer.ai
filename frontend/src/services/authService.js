// Authentication Service for managing JWT tokens

// Get API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === 'development'
        ? 'http://localhost:5000/v1'
        : 'https://prompt-enhancer.ai/v1');

// Storage keys for tokens
const TOKEN_KEY = 'auth_token';

/**
 * Get the stored authentication token
 * @returns {string|null} The stored token or null if not found
 */
export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

/**
 * Store the authentication token
 * @param {string} token - The token to store
 */
export const setToken = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Remove the stored token
 */
export const removeToken = () => {
    localStorage.removeItem(TOKEN_KEY);
};

/**
 * Check if the user is authenticated
 * @returns {boolean} True if user has a valid token
 */
export const isAuthenticated = () => {
    const token = getToken();
    if (!token) return false;

    // For a more thorough check, you could validate the token expiration
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp > Date.now() / 1000;
    } catch (error) {
        return false;
    }
};

/**
 * Get an authentication token from the server
 * @returns {Promise<string>} A promise that resolves to the token
 */
export const fetchToken = async () => {
    const apiKey = process.env.REACT_APP_API_KEY;

    if (!apiKey) {
        throw new Error('API key is not configured');
    }

    try {
        const response = await fetch(`${API_URL}/auth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                clientId: 'frontend-client',
                clientSecret: apiKey
            })
        });

        if (!response.ok) {
            throw new Error('Failed to authenticate');
        }

        const data = await response.json();
        const token = data.access_token;

        if (!token) {
            throw new Error('No token received from server');
        }

        // Store the token
        setToken(token);
        return token;
    } catch (error) {
        console.error('Authentication error:', error);
        throw error;
    }
};

/**
 * Initialize authentication by fetching a token if needed
 * @returns {Promise<string>} A promise that resolves to the token
 */
export const initializeAuth = async () => {
    // Check if we already have a valid token
    if (isAuthenticated()) {
        return getToken();
    }

    // Fetch a new token
    return await fetchToken();
};

// Create a named object for export to fix the ESLint error
const authService = {
    getToken,
    setToken,
    removeToken,
    isAuthenticated,
    fetchToken,
    initializeAuth
};

export default authService;