#!/usr/bin/env node

/**
 * Environment Setup Tool
 * 
 * This tool helps set up the .env file securely for development.
 * It can generate API keys and configure environment variables
 * without putting sensitive information in source code.
 * 
 * Now with support for CI/CD environments and GitHub Actions.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

// File paths
const ENV_EXAMPLE_PATH = path.join(__dirname, '../.env.example');
const ENV_PATH = path.join(__dirname, '../.env');
const GITIGNORE_PATH = path.join(__dirname, '../.gitignore');
const FRONTEND_ENV_PATH = path.join(__dirname, '../frontend/.env');
const FRONTEND_ENV_DEV_PATH = path.join(__dirname, '../frontend/.env.development');
const FRONTEND_ENV_LOCAL_PATH = path.join(__dirname, '../frontend/.env.local');
const FRONTEND_ENV_PROD_PATH = path.join(__dirname, '../frontend/.env.production');

// Set up readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * Check if running in CI environment
 * @returns {boolean} - Whether running in CI environment
 */
function isRunningInCI() {
    return process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
}

/**
 * Set up environment from CI variables
 * @returns {boolean} - Whether setup was successful
 */
function setupEnvFromCI() {
    // If running in CI environment, use environment variables directly
    if (isRunningInCI()) {
        console.log('Setting up environment from CI variables');

        // Ensure minimum required variables exist
        const requiredVars = ['API_KEY', 'AI_PROVIDER'];
        const missingVars = requiredVars.filter(varName => !process.env[varName]);

        if (missingVars.length > 0) {
            console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
            return false;
        }

        // Check provider-specific variables
        if (process.env.AI_PROVIDER === 'openai' && !process.env.OPENAI_API_KEY) {
            console.error('Missing OPENAI_API_KEY for OpenAI provider');
            return false;
        }

        if (process.env.AI_PROVIDER === 'mistral' && !process.env.MISTRAL_API_KEY) {
            console.error('Missing MISTRAL_API_KEY for Mistral provider');
            return false;
        }

        // Create .env file from environment variables
        try {
            let envContent = `# Environment generated from CI/CD process\n`;
            envContent += `NODE_ENV=${process.env.NODE_ENV || 'production'}\n`;
            envContent += `PORT=${process.env.PORT || '5000'}\n`;
            envContent += `API_KEY=${process.env.API_KEY}\n`;
            envContent += `AI_PROVIDER=${process.env.AI_PROVIDER}\n`;

            if (process.env.AI_PROVIDER === 'openai') {
                envContent += `OPENAI_API_KEY=${process.env.OPENAI_API_KEY}\n`;
            } else if (process.env.AI_PROVIDER === 'mistral') {
                envContent += `MISTRAL_API_KEY=${process.env.MISTRAL_API_KEY}\n`;
            }

            envContent += `CORS_ALLOWED_ORIGINS=${process.env.CORS_ALLOWED_ORIGINS || 'https://prompt-enhancer.ai'}\n`;

            fs.writeFileSync(ENV_PATH, envContent);
            console.log('✅ .env file created from CI variables');

            // Also create frontend .env file if needed
            syncFrontendApiKey(process.env.API_KEY);

            return true;
        } catch (error) {
            console.error('Error setting up environment from CI variables:', error.message);
            return false;
        }
    }

    return false;
}

/**
 * Generate a random API key
 * @returns {string} - Random API key
 */
function generateApiKey() {
    return crypto.randomBytes(24).toString('hex');
}

/**
 * Check if a file contains a string
 * @param {string} filePath - Path to the file
 * @param {string} searchString - String to search for
 * @returns {boolean} - Whether the file contains the string
 */
function fileContains(filePath, searchString) {
    if (!fs.existsSync(filePath)) return false;

    const content = fs.readFileSync(filePath, 'utf8');
    return content.includes(searchString);
}

/**
 * Ensure .env is in .gitignore
 */
function ensureGitignore() {
    if (!fs.existsSync(GITIGNORE_PATH)) {
        fs.writeFileSync(GITIGNORE_PATH, '.env\n');
        console.log('✅ Created .gitignore with .env entry');
        return;
    }

    if (!fileContains(GITIGNORE_PATH, '.env')) {
        fs.appendFileSync(GITIGNORE_PATH, '\n# Environment Variables\n.env\n');
        console.log('✅ Added .env to .gitignore');
    } else {
        console.log('✅ .env is already in .gitignore');
    }
}

/**
 * Sync API key between backend and frontend
 * @param {string} apiKey - The API key to sync
 */
async function syncFrontendApiKey(apiKey) {
    try {
        const frontendEnvPaths = [
            FRONTEND_ENV_PATH,
            FRONTEND_ENV_DEV_PATH,
            FRONTEND_ENV_LOCAL_PATH,
            FRONTEND_ENV_PROD_PATH
        ];

        for (const envPath of frontendEnvPaths) {
            let envContent = '';

            // Create directory if it doesn't exist
            const dirPath = path.dirname(envPath);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

            // Read existing content if file exists
            if (fs.existsSync(envPath)) {
                envContent = fs.readFileSync(envPath, 'utf8');

                // Replace existing API key
                if (envContent.includes('REACT_APP_API_KEY=')) {
                    envContent = envContent.replace(/REACT_APP_API_KEY=.*(\r?\n|$)/, `REACT_APP_API_KEY=${apiKey}$1`);
                } else {
                    // Add API key if it doesn't exist
                    envContent += `\nREACT_APP_API_KEY=${apiKey}\n`;
                }
            } else {
                // Create new file with API key
                let baseUrl = 'http://localhost:5000/v1';

                // Use appropriate URL for different environments
                if (envPath.includes('.production')) {
                    baseUrl = '/v1'; // For production, use relative path
                    console.log('💡 Setting production API URL to relative path: ' + baseUrl);
                }

                envContent = `REACT_APP_API_URL=${baseUrl}\nREACT_APP_API_KEY=${apiKey}\n`;

                // Add development options to .env.development
                if (envPath === FRONTEND_ENV_DEV_PATH) {
                    envContent += `DANGEROUSLY_DISABLE_HOST_CHECK=true\nWDS_SOCKET_HOST=localhost\nWDS_SOCKET_PORT=3000\n`;
                }
            }

            // Write updated content
            fs.writeFileSync(envPath, envContent);
            console.log(`✅ API key synced to ${envPath}`);
        }
    } catch (error) {
        console.error('Error syncing frontend API key:', error.message);
    }
}

/**
 * Setup the .env file
 */
async function setupEnv() {
    // Check for CI environment first
    if (setupEnvFromCI()) {
        console.log('✅ Environment setup from CI/CD variables successful!');
        rl.close();
        return;
    }

    console.log('\n🔧 Environment Setup Tool');
    console.log('-------------------------');

    // Check for .env.example
    if (!fs.existsSync(ENV_EXAMPLE_PATH)) {
        console.error('❌ .env.example file not found. Please make sure it exists.');
        rl.close();
        return;
    }

    // Check if .env already exists
    let overwrite = false;
    if (fs.existsSync(ENV_PATH)) {
        overwrite = await new Promise((resolve) => {
            rl.question('⚠️ .env file already exists. Overwrite? (y/n): ', (answer) => {
                resolve(answer.toLowerCase() === 'y');
            });
        });

        if (!overwrite) {
            console.log('Operation cancelled. Existing .env file was not modified.');
            rl.close();
            return;
        }
    }

    // Read .env.example
    const envExample = fs.readFileSync(ENV_EXAMPLE_PATH, 'utf8');

    // Configure environment type
    const envType = await new Promise((resolve) => {
        rl.question('Select environment (development/production): ', (answer) => {
            const env = answer.toLowerCase();
            return resolve(env === 'production' ? 'production' : 'development');
        });
    });

    // Configure AI provider
    const aiProvider = await new Promise((resolve) => {
        rl.question('Select AI provider (openai/mistral): ', (answer) => {
            const provider = answer.toLowerCase();
            return resolve(provider === 'mistral' ? 'mistral' : 'openai');
        });
    });

    console.log(`\nSetting up ${envType} environment with ${aiProvider} provider...`);

    // Generate API authentication key
    const apiKey = generateApiKey();
    console.log(`\n✅ Generated new API authentication key: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);

    // Update environment variables
    let envContent = envExample
        .replace(/NODE_ENV=.*/, `NODE_ENV=${envType}`)
        .replace(/API_KEY=.*/, `API_KEY=${apiKey}`)
        .replace(/AI_PROVIDER=.*/, `AI_PROVIDER=${aiProvider}`);

    // Get API keys
    if (aiProvider === 'openai') {
        const openaiKey = await new Promise((resolve) => {
            rl.question('OpenAI API Key: ', resolve);
        });


        if (openaiKey) {
            envContent = envContent.replace(/OPENAI_API_KEY=.*/, `OPENAI_API_KEY=${openaiKey}`);
        }

    } else if (aiProvider === 'mistral') {
        const mistralKey = await new Promise((resolve) => {
            rl.question('Mistral API Key: ', resolve);
        });

        if (mistralKey) {
            envContent = envContent.replace(/# MISTRAL_API_KEY=.*/, `MISTRAL_API_KEY=${mistralKey}`);
        }
    }

    // Write the new .env file
    fs.writeFileSync(ENV_PATH, envContent);
    console.log('\n✅ Environment file (.env) created successfully!');

    // Ensure .env is in .gitignore
    ensureGitignore();

    // Sync API key to frontend
    await syncFrontendApiKey(apiKey);
    console.log('✅ API key synced to frontend environment files');

    console.log('\n🚀 Your development environment is ready!');
    console.log('Run "npm run dev" to start the application.');

    rl.close();
}

/**
 * Print information about the environment configuration
 */
function printInfo() {
    if (!fs.existsSync(ENV_PATH)) {
        console.error('\n❌ .env file not found. Run "node setup-env.js setup" to create one.');
        rl.close();
        return;
    }

    const envContent = fs.readFileSync(ENV_PATH, 'utf8');

    // Parse key variables
    const envVars = {};
    const lines = envContent.split('\n');

    lines.forEach(line => {
        if (line.trim() && !line.startsWith('#')) {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const [, key, value] = match;
                envVars[key.trim()] = value.trim();
            }
        }
    });

    console.log('\n🔍 Environment Configuration');
    console.log('---------------------------');
    console.log(`Environment: ${envVars.NODE_ENV || 'Not set'}`);
    console.log(`AI Provider: ${envVars.AI_PROVIDER || 'Not set'}`);

    // Mask sensitive keys
    if (envVars.API_KEY) {
        const apiKey = envVars.API_KEY;
        console.log(`API Key: ${apiKey.substring(0, 4)}${'*'.repeat(10)}${apiKey.substring(apiKey.length - 4)}`);
    } else {
        console.log('API Key: Not set');
    }

    if (envVars.OPENAI_API_KEY) {
        const key = envVars.OPENAI_API_KEY;
        console.log(`OpenAI API Key: ${key.substring(0, 4)}${'*'.repeat(10)}${key.substring(key.length - 4)}`);
    } else {
        console.log('OpenAI API Key: Not set');
    }

    if (envVars.MISTRAL_API_KEY) {
        const key = envVars.MISTRAL_API_KEY;
        console.log(`Mistral API Key: ${key.substring(0, 4)}${'*'.repeat(10)}${key.substring(key.length - 4)}`);
    } else {
        console.log('Mistral API Key: Not set');
    }

    // Check frontend API key matching
    try {
        const frontendEnvPaths = [
            FRONTEND_ENV_PATH,
            FRONTEND_ENV_DEV_PATH,
            FRONTEND_ENV_LOCAL_PATH
        ];

        console.log('\n🔄 Frontend API Key Check:');
        let foundMismatch = false;

        for (const envPath of frontendEnvPaths) {
            if (fs.existsSync(envPath)) {
                const content = fs.readFileSync(envPath, 'utf8');
                const match = content.match(/REACT_APP_API_KEY=([^\s\n]+)/);

                if (match && match[1]) {
                    const frontendKey = match[1];
                    const isMatch = frontendKey === envVars.API_KEY;
                    console.log(`${path.basename(envPath)}: ${isMatch ? '✅ Matches' : '❌ Mismatch'}`);

                    if (!isMatch) {
                        foundMismatch = true;
                    }
                } else {
                    console.log(`${path.basename(envPath)}: ❌ No API key found`);
                    foundMismatch = true;
                }
            } else {
                console.log(`${path.basename(envPath)}: ⚠️ File not found`);
            }
        }

        if (foundMismatch) {
            console.log('\n⚠️ API key mismatch detected. Run "node setup-env.js sync" to sync API keys.');
        }
    } catch (error) {
        console.error('Error checking frontend API keys:', error.message);
    }

    console.log('---------------------------\n');
    rl.close();
}

/**
 * Sync API keys between backend and frontend
 */
async function syncKeys() {
    if (!fs.existsSync(ENV_PATH)) {
        console.error('\n❌ .env file not found. Run "node setup-env.js setup" to create one.');
        rl.close();
        return;
    }

    console.log('🔄 Syncing API keys from backend to frontend...');

    try {
        const envContent = fs.readFileSync(ENV_PATH, 'utf8');
        const match = envContent.match(/API_KEY=([^\s\n]+)/);

        if (!match || !match[1]) {
            console.error('\n❌ API key not found in backend .env file.');
            rl.close();
            return;
        }

        const apiKey = match[1];
        console.log(`\n🔄 Found API key: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);

        await syncFrontendApiKey(apiKey);
        console.log('\n✅ API keys synchronized successfully!');
    } catch (error) {
        console.error('\n❌ Error syncing API keys:', error.message);
    }

    rl.close();
}

/**
 * Check frontend production environment file
 */
function checkProductionEnv() {
    console.log('\n🔍 Checking frontend production environment file...');

    if (!fs.existsSync(ENV_PATH)) {
        console.error('❌ Backend .env file not found. Run "node setup-env.js setup" first.');
        rl.close();
        return;
    }

    if (!fs.existsSync(FRONTEND_ENV_PROD_PATH)) {
        console.log('❌ Frontend production environment file (.env.production) not found.');
        console.log('   Running sync to create it...');
        return syncKeys();
    }

    // Read the API key from backend
    const backendEnv = fs.readFileSync(ENV_PATH, 'utf8');
    const backendKeyMatch = backendEnv.match(/API_KEY=([^\s\n]+)/);

    if (!backendKeyMatch || !backendKeyMatch[1]) {
        console.error('❌ API key not found in backend .env file.');
        rl.close();
        return;
    }

    const backendKey = backendKeyMatch[1];

    // Read frontend production env
    const frontendEnv = fs.readFileSync(FRONTEND_ENV_PROD_PATH, 'utf8');
    const frontendKeyMatch = frontendEnv.match(/REACT_APP_API_KEY=([^\s\n]+)/);
    const frontendUrlMatch = frontendEnv.match(/REACT_APP_API_URL=([^\s\n]+)/);

    // Check API key
    if (!frontendKeyMatch || !frontendKeyMatch[1]) {
        console.log('❌ REACT_APP_API_KEY not found in frontend .env.production file.');
        console.log('   Running sync to fix it...');
        return syncKeys();
    }

    const frontendKey = frontendKeyMatch[1];

    if (frontendKey !== backendKey) {
        console.log('❌ API key mismatch between backend and frontend production.');
        console.log('   Running sync to fix it...');
        return syncKeys();
    }

    // Check API URL
    if (!frontendUrlMatch || frontendUrlMatch[1] !== '/v1') {
        console.log('❌ REACT_APP_API_URL not set to "/v1" in frontend .env.production file.');
        console.log('   Running sync to fix it...');
        return syncKeys();
    }

    console.log('✅ Frontend production environment looks good!');
    console.log(`   API Key: ${frontendKey.substring(0, 4)}${'*'.repeat(8)}${frontendKey.substring(frontendKey.length - 4)}`);
    console.log('   API URL: /v1');
    rl.close();
}

/**
 * Print help information
 */
function printHelp() {
    console.log('\n🔧 Environment Setup Tool');
    console.log('------------------------');
    console.log('Usage:');
    console.log('  node setup-env.js setup      - Set up the .env file');
    console.log('  node setup-env.js info       - Show current environment configuration');
    console.log('  node setup-env.js sync       - Sync API keys between backend and frontend');
    console.log('  node setup-env.js production - Check frontend production environment');
    console.log('  node setup-env.js help       - Show this help message\n');
    rl.close();
}

// Main function to handle command line arguments
function main() {
    const args = process.argv.slice(2);
    const command = args[0]?.toLowerCase();

    switch (command) {
        case 'setup':
            setupEnv();
            break;
        case 'info':
            printInfo();
            break;
        case 'sync':
            syncKeys();
            break;
        case 'production':
        case 'prod':
            checkProductionEnv();
            break;
        case 'help':
        default:
            printHelp();
            break;
    }
}

// Run the script
main();