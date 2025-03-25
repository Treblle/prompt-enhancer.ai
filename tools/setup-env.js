#!/usr/bin/env node

/**
 * Environment Setup Tool
 * 
 * This tool helps set up the .env file securely for development.
 * It generates dynamic API keys for development and local environments,
 * but uses a fixed hardcoded API key for production.
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

// Hardcoded production API key - NEVER CHANGE THIS VALUE
// This is the key that will be used in production environments
const PRODUCTION_API_KEY = '071ab274d796058af0f2c1c205b78009670fc774bd574960';

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

        // For CI environments, we use the production API key
        try {
            let envContent = `# Environment generated from CI/CD process\n`;
            envContent += `NODE_ENV=${process.env.NODE_ENV || 'production'}\n`;
            envContent += `PORT=${process.env.PORT || '5000'}\n`;
            // Always use the production API key in CI/CD environments
            envContent += `API_KEY=${PRODUCTION_API_KEY}\n`;
            envContent += `AI_PROVIDER=${process.env.AI_PROVIDER || 'openai'}\n`;

            if (process.env.AI_PROVIDER === 'openai' || !process.env.AI_PROVIDER) {
                envContent += `OPENAI_API_KEY=${process.env.OPENAI_API_KEY || 'replace_with_your_openai_key'}\n`;
            } else if (process.env.AI_PROVIDER === 'mistral') {
                envContent += `MISTRAL_API_KEY=${process.env.MISTRAL_API_KEY || 'replace_with_your_mistral_key'}\n`;
            }

            envContent += `CORS_ALLOWED_ORIGINS=${process.env.CORS_ALLOWED_ORIGINS || 'https://prompt-enhancer.ai'}\n`;

            fs.writeFileSync(ENV_PATH, envContent);
            console.log('✅ .env file created from CI variables with production API key');

            // Also create frontend .env file with the production API key
            syncFrontendApiKey(PRODUCTION_API_KEY, true);

            return true;
        } catch (error) {
            console.error('Error setting up environment from CI variables:', error.message);
            return false;
        }
    }

    return false;
}

/**
 * Generate a random API key for development environments
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
 * @param {boolean} isProduction - Whether this is for production environment
 */
async function syncFrontendApiKey(apiKey, isProduction = false) {
    try {
        const frontendEnvPaths = [
            FRONTEND_ENV_PATH,
            FRONTEND_ENV_DEV_PATH,
            FRONTEND_ENV_LOCAL_PATH
        ];

        // For production environment, we'll handle it separately
        if (isProduction) {
            frontendEnvPaths.push(FRONTEND_ENV_PROD_PATH);
        }

        for (const envPath of frontendEnvPaths) {
            let envContent = '';
            const isProductionFile = envPath === FRONTEND_ENV_PROD_PATH;

            // Create directory if it doesn't exist
            const dirPath = path.dirname(envPath);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

            // Read existing content if file exists
            if (fs.existsSync(envPath)) {
                envContent = fs.readFileSync(envPath, 'utf8');

                // For production file, always use the hardcoded production API key
                const keyToUse = isProductionFile ? PRODUCTION_API_KEY : apiKey;

                // Replace existing API key
                if (envContent.includes('REACT_APP_API_KEY=')) {
                    envContent = envContent.replace(/REACT_APP_API_KEY=.*(\r?\n|$)/, `REACT_APP_API_KEY=${keyToUse}$1`);
                } else {
                    // Add API key if it doesn't exist
                    envContent += `\nREACT_APP_API_KEY=${keyToUse}\n`;
                }
            } else {
                // Create new file with API key
                let baseUrl = 'http://localhost:5000/v1';

                // For production file, always use the hardcoded production API key
                const keyToUse = isProductionFile ? PRODUCTION_API_KEY : apiKey;

                // Use appropriate URL for different environments
                if (isProductionFile) {
                    baseUrl = '/v1'; // For production, use relative path
                    console.log('💡 Setting production API URL to relative path: ' + baseUrl);
                }

                envContent = `REACT_APP_API_URL=${baseUrl}\nREACT_APP_API_KEY=${keyToUse}\n`;

                // Add development options to .env.development
                if (envPath === FRONTEND_ENV_DEV_PATH) {
                    envContent += `DANGEROUSLY_DISABLE_HOST_CHECK=true\nWDS_SOCKET_HOST=localhost\nWDS_SOCKET_PORT=3000\n`;
                }
            }

            // Write updated content
            fs.writeFileSync(envPath, envContent);
            console.log(`✅ API key synced to ${envPath}${isProductionFile ? ' (using production key)' : ''}`);
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
    console.log('NOTE: Different API keys will be used for development and production:');
    console.log('  - Development: Randomly generated key (unique for your local setup)');
    console.log('  - Production: Fixed hardcoded key (071ab274796058af0f2c1c205b78009670fc774bd574960)');
    console.log('-------------------------\n');

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

    // Use the appropriate API key based on environment
    let apiKey;
    if (envType === 'production') {
        apiKey = PRODUCTION_API_KEY;
        console.log(`\n✅ Using production API key: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
    } else {
        // Generate a random key for development
        apiKey = generateApiKey();
        console.log(`\n✅ Generated new development API key: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
    }

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
    await syncFrontendApiKey(apiKey, envType === 'production');

    if (envType === 'production') {
        console.log('✅ Production API key synced to frontend environment files');
    } else {
        console.log('✅ Development API key synced to frontend environment files');
        console.log('✅ Production API key set in .env.production for production builds');
    }

    console.log('\n🚀 Your environment is ready!');
    console.log(`Run "npm run ${envType === 'production' ? 'start' : 'dev'}" to start the application.`);

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

        // Check if using production key
        if (apiKey === PRODUCTION_API_KEY) {
            console.log('⚠️ Using PRODUCTION API key in this environment');
        } else {
            console.log('ℹ️ Using DEVELOPMENT API key in this environment');
        }
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
            FRONTEND_ENV_LOCAL_PATH,
            FRONTEND_ENV_PROD_PATH
        ];

        console.log('\n🔄 Frontend API Key Check:');

        for (const envPath of frontendEnvPaths) {
            if (fs.existsSync(envPath)) {
                const content = fs.readFileSync(envPath, 'utf8');
                const match = content.match(/REACT_APP_API_KEY=([^\s\n]+)/);

                if (match && match[1]) {
                    const frontendKey = match[1];
                    const isProductionFile = envPath === FRONTEND_ENV_PROD_PATH;

                    // For production files, they should always use the production API key
                    if (isProductionFile) {
                        const isCorrectProdKey = frontendKey === PRODUCTION_API_KEY;
                        console.log(`${path.basename(envPath)}: ${isCorrectProdKey ? '✅ Correct production key' : '❌ Wrong production key!'}`);
                    } else {
                        // For development files, they should match the current environment's key
                        const isMatch = frontendKey === envVars.API_KEY;
                        console.log(`${path.basename(envPath)}: ${isMatch ? '✅ Matches' : '❌ Mismatch with current environment'}`);
                    }
                } else {
                    console.log(`${path.basename(envPath)}: ❌ No API key found`);
                }
            } else {
                console.log(`${path.basename(envPath)}: ⚠️ File not found`);
            }
        }
    } catch (error) {
        console.error('Error checking frontend API keys:', error.message);
    }

    console.log('---------------------------\n');
    rl.close();
}

/**
 * Setup production-specific configuration
 */
async function setupProduction() {
    console.log('\n🚀 Production Environment Setup');
    console.log('------------------------------');
    console.log('This will configure your environment files to use the production API key.');
    console.log(`Production API Key: ${PRODUCTION_API_KEY.substring(0, 4)}...${PRODUCTION_API_KEY.substring(PRODUCTION_API_KEY.length - 4)}`);
    console.log('------------------------------\n');

    const proceed = await new Promise((resolve) => {
        rl.question('Do you want to proceed with production setup? (y/n): ', (answer) => {
            resolve(answer.toLowerCase() === 'y');
        });
    });

    if (!proceed) {
        console.log('Operation cancelled.');
        rl.close();
        return;
    }

    // Create production frontend environment file
    try {
        let prodEnvContent = '';

        if (fs.existsSync(FRONTEND_ENV_PROD_PATH)) {
            prodEnvContent = fs.readFileSync(FRONTEND_ENV_PROD_PATH, 'utf8');

            // Update API URL if needed
            if (!prodEnvContent.includes('REACT_APP_API_URL=/v1')) {
                prodEnvContent = prodEnvContent.replace(/REACT_APP_API_URL=.*(\r?\n|$)/, 'REACT_APP_API_URL=/v1$1');
            } else if (!prodEnvContent.includes('REACT_APP_API_URL=')) {
                prodEnvContent += '\nREACT_APP_API_URL=/v1\n';
            }

            // Update API key to production key
            if (prodEnvContent.includes('REACT_APP_API_KEY=')) {
                prodEnvContent = prodEnvContent.replace(/REACT_APP_API_KEY=.*(\r?\n|$)/, `REACT_APP_API_KEY=${PRODUCTION_API_KEY}$1`);
            } else {
                prodEnvContent += `\nREACT_APP_API_KEY=${PRODUCTION_API_KEY}\n`;
            }
        } else {
            // Create new production environment file
            prodEnvContent = `REACT_APP_API_URL=/v1\nREACT_APP_API_KEY=${PRODUCTION_API_KEY}\n`;
        }

        // Write the production environment file
        fs.writeFileSync(FRONTEND_ENV_PROD_PATH, prodEnvContent);
        console.log('✅ Production frontend environment file created/updated successfully.');

        // Update Vercel configuration if it exists
        const vercelConfigPath = path.join(__dirname, '../vercel.json');
        if (fs.existsSync(vercelConfigPath)) {
            const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));

            // Update API key in Vercel config
            if (vercelConfig.env && vercelConfig.env.API_KEY) {
                vercelConfig.env.API_KEY = PRODUCTION_API_KEY;
                fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2));
                console.log('✅ Updated API key in vercel.json');
            }
        }

        console.log('\n✅ Production setup completed successfully!');
    } catch (error) {
        console.error('Error setting up production environment:', error.message);
    }

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
        const envTypeMatch = envContent.match(/NODE_ENV=([^\s\n]+)/);
        const envType = envTypeMatch ? envTypeMatch[1] : 'development';

        if (!match || !match[1]) {
            console.error('\n❌ API key not found in backend .env file.');
            rl.close();
            return;
        }

        const apiKey = match[1];
        const isProduction = envType === 'production' || apiKey === PRODUCTION_API_KEY;

        console.log(`\n🔄 Found API key: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
        console.log(`🔄 Environment type: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);

        await syncFrontendApiKey(apiKey, isProduction);
        console.log('\n✅ API keys synchronized successfully!');

        // Always ensure production env file has the production key
        let prodEnvContent = '';
        if (fs.existsSync(FRONTEND_ENV_PROD_PATH)) {
            prodEnvContent = fs.readFileSync(FRONTEND_ENV_PROD_PATH, 'utf8');
            if (prodEnvContent.includes('REACT_APP_API_KEY=')) {
                prodEnvContent = prodEnvContent.replace(/REACT_APP_API_KEY=.*(\r?\n|$)/, `REACT_APP_API_KEY=${PRODUCTION_API_KEY}$1`);
            } else {
                prodEnvContent += `\nREACT_APP_API_KEY=${PRODUCTION_API_KEY}\n`;
            }
        } else {
            prodEnvContent = `REACT_APP_API_URL=/v1\nREACT_APP_API_KEY=${PRODUCTION_API_KEY}\n`;
        }

        fs.writeFileSync(FRONTEND_ENV_PROD_PATH, prodEnvContent);
        console.log('✅ Production API key set in .env.production');
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
    console.log('  node setup-env.js setup       - Set up the .env file with appropriate API keys');
    console.log('  node setup-env.js info        - Show current environment configuration');
    console.log('  node setup-env.js sync        - Sync API keys between backend and frontend');
    console.log('  node setup-env.js production  - Configure environment for production');
    console.log('  node setup-env.js help        - Show this help message\n');

    console.log('API Key Handling:');
    console.log('  - Development environments use randomly generated API keys');
    console.log('  - Production environment uses a fixed hardcoded API key');
    console.log(`  - Production API Key: ${PRODUCTION_API_KEY.substring(0, 4)}...${PRODUCTION_API_KEY.substring(PRODUCTION_API_KEY.length - 4)}\n`);

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
            setupProduction();
            break;
        case 'help':
        default:
            printHelp();
            break;
    }
}

// Run the script
main();