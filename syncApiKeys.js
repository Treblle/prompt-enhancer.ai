// syncApiKeys.js
// Save this file to the root of your project

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Function to extract API key from a file
function extractApiKey(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const match = fileContent.match(/API_KEY=([^\s\n]+)/);
            return match ? match[1] : null;
        }
    } catch (err) {
        console.error(`Error reading ${filePath}:`, err);
    }
    return null;
}

// Function to update a .env file with a new API key
function updateApiKey(filePath, apiKey, keyPattern) {
    try {
        if (fs.existsSync(filePath)) {
            let fileContent = fs.readFileSync(filePath, 'utf8');

            // Replace or add the API key
            if (fileContent.match(keyPattern)) {
                fileContent = fileContent.replace(keyPattern, `$1${apiKey}`);
            } else {
                fileContent += `\n${keyPattern.source.replace(/\\1/, '')}'${apiKey}`;
            }

            fs.writeFileSync(filePath, fileContent);
            console.log(`Updated API key in ${filePath}`);
            return true;
        } else {
            console.error(`File not found: ${filePath}`);
        }
    } catch (err) {
        console.error(`Error updating ${filePath}:`, err);
    }
    return false;
}

// Main function
function syncApiKeys() {
    // Paths to .env files
    const backendEnvPath = path.join(__dirname, '.env');
    const frontendEnvDevPath = path.join(__dirname, 'frontend', '.env.development');
    const frontendEnvPath = path.join(__dirname, 'frontend', '.env');

    // Extract backend API key
    const backendApiKey = extractApiKey(backendEnvPath);

    if (!backendApiKey) {
        console.error('Could not find API_KEY in backend .env file');
        return;
    }

    console.log(`Found API key: ${backendApiKey.substring(0, 4)}...${backendApiKey.substring(backendApiKey.length - 4)}`);

    // Update frontend .env files
    updateApiKey(frontendEnvPath, backendApiKey, /(REACT_APP_API_KEY=).*/);
    updateApiKey(frontendEnvDevPath, backendApiKey, /(REACT_APP_API_KEY=).*/);

    console.log('API key synchronization complete!');
}

// Run the script
syncApiKeys();