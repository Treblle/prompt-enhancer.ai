require('dotenv').config();
const app = require('./app');
const keyManager = require('./src/utils/keyManager');
const config = require('./src/config/config');
const fs = require('fs');
const path = require('path');

// Fixed API key for production environment - NEVER CHANGE THIS VALUE
const PRODUCTION_API_KEY = '071ab274d796058af0f2c1c205b78009670fc774bd574960';

// Add the debug endpoint
app.get('/api-check', (req, res) => {
    // Don't expose actual keys, just confirmation
    const apiKey = process.env.NODE_ENV === 'production'
        ? PRODUCTION_API_KEY
        : process.env.API_KEY;

    res.json({
        apiKeyConfigured: !!apiKey,
        apiKeyFirstFour: apiKey ? apiKey.substring(0, 4) : null,
        apiKeyIsProduction: apiKey === PRODUCTION_API_KEY,
        openAIConfigured: !!process.env.OPENAI_API_KEY,
        nodeEnv: process.env.NODE_ENV,
        corsOrigins: process.env.CORS_ALLOWED_ORIGINS,
        treblleConfigured: process.env.NODE_ENV === 'production'
            ? {
                apiKeyAvailable: !!process.env.TREBLLE_API_KEY,
                projectIdAvailable: !!process.env.TREBLLE_PROJECT_ID,
                apiKeyPrefix: process.env.TREBLLE_API_KEY ? process.env.TREBLLE_API_KEY.substring(0, 4) : null,
                enabled: !!process.env.TREBLLE_API_KEY && !!process.env.TREBLLE_PROJECT_ID
            }
            : 'Disabled in non-production'
    });
});

app.get('/test-server', (req, res) => {
    res.json({
        message: 'Server is running',
        env: process.env.NODE_ENV
    });
});

// Define the port
const PORT = process.env.PORT || 5000;

// Check if .env file exists (but skip in production)
const envPath = path.join(__dirname, '.env');
if (process.env.NODE_ENV !== 'production' && !fs.existsSync(envPath)) {
    console.error('\n❌ ERROR: .env file not found!');
    console.error('Please create a .env file based on .env.example with your API keys.\n');
    console.error('$ cp .env.example .env\n');
    process.exit(1);
}

// Initialize key manager before starting the server
keyManager.initialize();

// Validate environment
const validation = keyManager.validateEnvironment();
const keyStatus = keyManager.getStatus();

// Log startup information
console.log('\n----------------------------------------');
console.log('🔐 API Key Status:');
console.log('----------------------------------------');

if (process.env.NODE_ENV === 'production') {
    console.log(`API Key: ✅ Using PRODUCTION API Key`);
    console.log(`API Key Value: ${PRODUCTION_API_KEY.substring(0, 4)}...${PRODUCTION_API_KEY.substring(PRODUCTION_API_KEY.length - 4)}`);
} else {
    const apiKeyStatus = keyStatus.api?.available ? '✅ Available' : '❌ Missing';
    const isProductionKey = keyStatus.api?.isProduction;
    console.log(`API Key: ${apiKeyStatus}${isProductionKey ? ' (Using PRODUCTION key in non-production environment)' : ''}`);
}

console.log(`AI Provider: ${process.env.AI_PROVIDER || 'openai'}`);

if (process.env.AI_PROVIDER === 'openai') {
    console.log(`OpenAI API Key: ${keyStatus.openai?.available ? '✅ Available' : '❌ Missing'}`);
} else if (process.env.AI_PROVIDER === 'mistral') {
    console.log(`Mistral API Key: ${keyStatus.mistral?.available ? '✅ Available' : '❌ Missing'}`);
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

// Show warnings in development, exit in production if validation fails
if (!validation.valid) {
    console.log('\n⚠️ Environment Validation Warnings:');
    validation.errors.forEach(error => {
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

// Display any warnings
if (validation.warnings && validation.warnings.length > 0) {
    console.log('\n⚠️ Environment Validation Warnings:');
    validation.warnings.forEach(warning => {
        console.log(`  - ${warning}`);
    });
}

// Start the server (only once)
app.listen(PORT, () => {
    console.log('\n----------------------------------------');
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('----------------------------------------');
    console.log(`📝 API Documentation: http://localhost:${PORT}/docs`);
    console.log(`🔒 Security: Rate limiting and DDoS protection active`);
    console.log(`🔑 Environment: ${process.env.NODE_ENV}`);
    if (process.env.NODE_ENV === 'production') {
        console.log(`🔒 Using PRODUCTION API Key`);
        console.log(`🔍 Treblle API monitoring: ${!!process.env.TREBLLE_API_KEY && !!process.env.TREBLLE_PROJECT_ID ? 'Active' : 'Not configured'}`);
    }
    console.log('----------------------------------------\n');
});

// Only define PORT variable in development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
}

module.exports = app;