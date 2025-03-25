require('dotenv').config();
const app = require('./app');
const keyManager = require('./src/utils/keyManager');
const config = require('./src/config/config');
const fs = require('fs');
const path = require('path');

// Add the debug endpoint
app.get('/api-check', (req, res) => {
    // Don't expose actual keys, just confirmation
    res.json({
        apiKeyConfigured: !!process.env.API_KEY,
        apiKeyFirstFour: process.env.API_KEY ? process.env.API_KEY.substring(0, 4) : null,
        openAIConfigured: !!process.env.OPENAI_API_KEY,
        nodeEnv: process.env.NODE_ENV,
        corsOrigins: process.env.CORS_ALLOWED_ORIGINS
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
console.log(`API Key: ${keyStatus.api?.available ? '✅ Available' : '❌ Missing'}`);
console.log(`AI Provider: ${process.env.AI_PROVIDER || 'openai'}`);

if (process.env.AI_PROVIDER === 'openai') {
    console.log(`OpenAI API Key: ${keyStatus.openai?.available ? '✅ Available' : '❌ Missing'}`);
} else if (process.env.AI_PROVIDER === 'mistral') {
    console.log(`Mistral API Key: ${keyStatus.mistral?.available ? '✅ Available' : '❌ Missing'}`);
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

// Start the server (only once)
app.listen(PORT, () => {
    console.log('\n----------------------------------------');
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('----------------------------------------');
    console.log(`📝 API Documentation: http://localhost:${PORT}/docs`);
    console.log(`🔒 Security: Rate limiting and DDoS protection active`);
    console.log('----------------------------------------\n');
});

module.exports = app;