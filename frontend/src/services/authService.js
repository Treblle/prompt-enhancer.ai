// Get API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === 'development'
        ? 'http://localhost:5000/v1'
        : 'https://prompt-enhancer.ai/v1');

// Storage keys for tokens
const TOKEN_KEY = 'auth_token';
const API_KEY_KEY = 'api_key';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';

// Utility function to get the API key
function getApiKey() {
    return process.env.REACT_APP_API_KEY || localStorage.getItem(API_KEY_KEY);
}

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

    // Set expiry for 24 hours in the future
    const expiry = Date.now() + (24 * 60 * 60 * 1000);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
};

/**
 * Remove the stored token
 */
export const removeToken = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
};

/**
 * Check if the user is authenticated
 * @returns {boolean} True if user has a valid token
 */
export const isAuthenticated = () => {
    const token = getToken();
    if (!token) return false;

    // Check token expiration from our stored expiry time
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (expiry && parseInt(expiry) > Date.now()) {
        return true;
    }

    // If expiry isn't set or is in the past, token is invalid
    removeToken();
    return false;
};

/**
 * Get an authentication token from the server
 * @returns {Promise<string>} A promise that resolves to the token
 */
export const fetchToken = async () => {
    const apiKey = getApiKey();

    if (!apiKey) {
        console.error('API key is not configured');
        throw new Error('API key is not configured');
    }

    try {
        console.log('Fetching new auth token...');
        const response = await fetch(`${API_URL}/auth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey
            },
            body: JSON.stringify({
                clientId: 'frontend-client',
                clientSecret: apiKey
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Token fetch error:', errorText);
            throw new Error(`Failed to authenticate: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        const token = data.access_token;

        if (!token) {
            throw new Error('No token received from server');
        }

        console.log('Token fetched successfully');

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
        console.log('Using existing valid token');
        return getToken();
    }

    console.log('No valid token found, fetching new one');

    try {
        // Fetch a new token
        return await fetchToken();
    } catch (error) {
        console.error('Failed to initialize auth:', error);

        // Try one more time after a short delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return await fetchToken();
    }
};

// Create a named object for export
const authService = {
    getToken,
    setToken,
    removeToken,
    isAuthenticated,
    fetchToken,
    initializeAuth,
    getApiKey
};

export default authService;