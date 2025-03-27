require('dotenv').config();
const app = require('./app');
const config = require('./src/config/config');
const fs = require('fs');
const path = require('path');

// Define the port
const PORT = process.env.PORT || 5000;

// Add the debug endpoint with improved security
app.get('/api-check', (req, res) => {
    // Don't expose actual keys, just confirmation
    const apiKey = process.env.API_KEY;

    // Only return minimal info needed for debugging
    res.json({
        apiKeyConfigured: !!apiKey,
        apiKeyLength: apiKey ? apiKey.length : null,
        openAIConfigured: !!process.env.OPENAI_API_KEY,
        nodeEnv: process.env.NODE_ENV,
        corsOrigins: Array.isArray(config.cors.origins) ?
            config.cors.origins.map(origin => origin.replace(/^https?:\/\//, '')) :
            'Not configured',
        treblleConfigured: process.env.NODE_ENV === 'production'
            ? {
                apiKeyAvailable: !!process.env.TREBLLE_API_KEY,
                projectIdAvailable: !!process.env.TREBLLE_PROJECT_ID,
                enabled: !!process.env.TREBLLE_API_KEY && !!process.env.TREBLLE_PROJECT_ID
            }
            : 'Disabled in non-production'
    });
});

// Check if .env file exists (but skip in production)
const envPath = path.join(__dirname, '.env');
if (process.env.NODE_ENV !== 'production' && !fs.existsSync(envPath)) {
    console.error('\n❌ ERROR: .env file not found!');
    console.error('Please create a .env file based on .env.example with your API keys.\n');
    console.error('$ cp .env.example .env\n');
    process.exit(1);
}

// Basic key management functions
function maskKey(key) {
    if (!key || key.length < 8) return 'Invalid Key';
    const firstChars = key.substring(0, 4);
    const lastChars = key.substring(key.length - 4);
    return `${firstChars}${'*'.repeat(Math.min(key.length - 8, 12))}${lastChars}`;
}

// Validate and check keys
const API_KEY = process.env.API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const AI_PROVIDER = process.env.AI_PROVIDER || 'openai';

// Log startup information with masked keys
console.log('\n----------------------------------------');
console.log('🔐 API Key Status:');
console.log('----------------------------------------');

console.log(`API Key: ${API_KEY ? `✅ ${maskKey(API_KEY)}` : '❌ Missing'}`);
console.log(`AI Provider: ${AI_PROVIDER}`);

if (AI_PROVIDER === 'openai') {
    console.log(`OpenAI API Key: ${OPENAI_API_KEY ? `✅ ${maskKey(OPENAI_API_KEY)}` : '❌ Missing'}`);
} else if (AI_PROVIDER === 'mistral') {
    console.log(`Mistral API Key: ${MISTRAL_API_KEY ? `✅ ${maskKey(MISTRAL_API_KEY)}` : '❌ Missing'}`);
}

// Show Treblle status in production
if (process.env.NODE_ENV === 'production') {
    const treblleApiKeyConfigured = !!process.env.TREBLLE_API_KEY;
    const treblleProjectIdConfigured = !!process.env.TREBLLE_PROJECT_ID;

    if (treblleApiKeyConfigured && treblleProjectIdConfigured) {
        console.log(`Treblle API Monitoring: ✅ Enabled`);
    } else {
        console.log(`Treblle API Monitoring: ❌ Missing configuration`);
        if (!treblleApiKeyConfigured) console.log(`  - TREBLLE_API_KEY is not configured`);
        if (!treblleProjectIdConfigured) console.log(`  - TREBLLE_PROJECT_ID is not configured`);
    }
} else {
    console.log(`Treblle API Monitoring: ⏸️ Disabled in non-production environment`);
}

// Simple environment validation
let isValidConfig = true;
const validationErrors = [];

if (!API_KEY) {
    validationErrors.push('API_KEY is not configured');
    isValidConfig = false;
}

if (AI_PROVIDER === 'openai' && !OPENAI_API_KEY) {
    validationErrors.push('OPENAI_API_KEY is required when using OpenAI provider');
    isValidConfig = false;
}

if (AI_PROVIDER === 'mistral' && !MISTRAL_API_KEY) {
    validationErrors.push('MISTRAL_API_KEY is required when using Mistral provider');
    isValidConfig = false;
}

// Show warnings in development, exit in production if validation fails
if (!isValidConfig) {
    console.log('\n⚠️ Environment Validation Warnings:');
    validationErrors.forEach(error => {
        console.log(`  - ${error}`);
    });

    if (process.env.NODE_ENV === 'production') {
        console.error('\n❌ Exiting: Cannot start in production with invalid configuration!');
        process.exit(1);
    } else {
        console.log('\n⚠️ WARNING: Starting in development mode despite configuration issues.');
        console.log('   Some features may not work correctly without valid API keys.');
    }
}

// Start the server (only once)
app.listen(PORT, () => {
    console.log('\n----------------------------------------');
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('----------------------------------------');
    console.log(`📝 API Documentation: http://localhost:${PORT}/docs`);
    console.log(`🔒 Security: Rate limiting and DDoS protection active`);
    console.log(`🔑 Environment: ${process.env.NODE_ENV}`);
    console.log('----------------------------------------\n');
});

module.exports = app;