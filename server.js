require('dotenv').config();
const app = require('./app');
const keyManager = require('./src/utils/keyManager');
const config = require('./src/config/config');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
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

// Start the server
app.listen(PORT, () => {
    console.log('\n----------------------------------------');
    console.log(`🚀 Server running on http://localhost:3000`);
    console.log('----------------------------------------');
    console.log(`📝 API Documentation: http://localhost:${PORT}/docs`);
    console.log(`🔒 Security: Rate limiting and DDoS protection active`);
    console.log('----------------------------------------\n');
});