#!/usr/bin/env node

/**
 * Environment Setup Tool
 * 
 * This tool helps set up the .env file securely for development.
 * It can generate API keys and configure environment variables
 * without putting sensitive information in source code.
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

// Set up readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * Generate a random API key
 * @returns {string} - Random API key
 */
function generateApiKey() {
    return crypto.randomBytes(24).toString('base64').replace(/[+/=]/g, '');
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
            FRONTEND_ENV_LOCAL_PATH
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
                envContent = `REACT_APP_API_URL=http://localhost:5000/v1\nREACT_APP_API_KEY=${apiKey}\n`;

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

        const openaiOrgId = await new Promise((resolve) => {
            rl.question('OpenAI Organization ID (optional): ', resolve);
        });

        if (openaiKey) {
            envContent = envContent.replace(/OPENAI_API_KEY=.*/, `OPENAI_API_KEY=${openaiKey}`);
        }

        if (openaiOrgId) {
            envContent = envContent.replace(/# OPENAI_ORG_ID=.*/, `OPENAI_ORG_ID=${openaiOrgId}`);
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

    if (envVars.OPENAI_ORG_ID) {
        const orgId = envVars.OPENAI_ORG_ID;
        console.log(`OpenAI Org ID: ${orgId.substring(0, 4)}${'*'.repeat(6)}${orgId.substring(orgId.length - 4)}`);
    } else {
        console.log('OpenAI Org ID: Not set');
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
 * Print help information
 */
function printHelp() {
    console.log('\n🔧 Environment Setup Tool');
    console.log('------------------------');
    console.log('Usage:');
    console.log('  node setup-env.js setup  - Set up the .env file');
    console.log('  node setup-env.js info   - Show current environment configuration');
    console.log('  node setup-env.js sync   - Sync API keys between backend and frontend');
    console.log('  node setup-env.js help   - Show this help message\n');
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
        case 'help':
        default:
            printHelp();
            break;
    }
}

// Run the script
main();