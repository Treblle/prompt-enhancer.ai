#!/usr/bin/env node

/**
 * API Key Encryption Tool
 * 
 * This tool helps securely encrypt API keys for safekeeping
 * while avoiding exposure in source code repositories.
 * 
 * Usage:
 * 1. Store keys: node encrypt-keys.js save
 * 2. View keys: node encrypt-keys.js view
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configure the secure storage location
const KEYS_FILE = path.join(__dirname, '../.secure-keys.json');
const ALGORITHM = 'aes-256-gcm';

// Set up readline interface for user interaction
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * Prompt for password with asterisk masking
 * @param {string} query - Prompt message
 * @returns {Promise<string>} - User input
 */
function promptPassword(query) {
    return new Promise((resolve) => {
        const stdin = process.stdin;
        const stdout = process.stdout;

        stdout.write(query);

        // Set raw mode to capture each character
        stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding('utf8');

        let password = '';

        // Process each keypress
        stdin.on('data', function handler(char) {
            char = char.toString();

            // Check for ctrl+c
            if (char === '\u0003') {
                stdout.write('\n');
                process.exit();
            }

            // Check for backspace
            if (char === '\u0008' || char === '\u007F') {
                if (password.length > 0) {
                    password = password.slice(0, -1);
                    stdout.write('\b \b'); // Erase character from screen
                }
                return;
            }

            // Check for enter key
            if (char === '\r' || char === '\n') {
                stdout.write('\n');
                stdin.setRawMode(false);
                stdin.pause();
                stdin.removeListener('data', handler);
                resolve(password);
                return;
            }

            // Add character to password and display asterisk
            password += char;
            stdout.write('*');
        });
    });
}

/**
 * Generate a secure key from a password
 * @param {string} password - User password
 * @returns {Buffer} - Derived key
 */
function deriveKey(password) {
    const salt = crypto.randomBytes(16);
    const key = crypto.scryptSync(password, salt, 32);
    return { key, salt };
}

/**
 * Encrypt data with a password
 * @param {Object} data - Data to encrypt
 * @param {string} password - Password for encryption
 * @returns {Object} - Encrypted data with metadata
 */
function encrypt(data, password) {
    // Derive a key from the password
    const { key, salt } = deriveKey(password);

    // Generate a random initialization vector
    const iv = crypto.randomBytes(16);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt the data
    const dataString = JSON.stringify(data);
    let encrypted = cipher.update(dataString, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get the authentication tag
    const authTag = cipher.getAuthTag();

    // Return encrypted data with metadata for decryption
    return {
        encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        salt: salt.toString('hex')
    };
}

/**
 * Decrypt data with a password
 * @param {Object} encryptedData - Encrypted data object
 * @param {string} password - Password for decryption
 * @returns {Object} - Decrypted data
 */
function decrypt(encryptedData, password) {
    try {
        const { encrypted, iv, authTag, salt } = encryptedData;

        // Derive the key from the password and salt
        const key = crypto.scryptSync(password, Buffer.from(salt, 'hex'), 32);

        // Create decipher
        const decipher = crypto.createDecipheriv(
            ALGORITHM,
            key,
            Buffer.from(iv, 'hex')
        );

        // Set auth tag
        decipher.setAuthTag(Buffer.from(authTag, 'hex'));

        // Decrypt the data
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        // Parse and return the JSON data
        return JSON.parse(decrypted);
    } catch (error) {
        throw new Error('Decryption failed. Incorrect password or corrupted data.');
    }
}

/**
 * Save encrypted API keys
 */
async function saveKeys() {
    console.log('\n🔐 API Key Encryption Tool');
    console.log('-------------------------');
    console.log('This tool will encrypt your API keys using a password of your choice.');
    console.log('The keys will be stored in a secure encrypted file (not on any remote servers).');
    console.log('You will need this password to view your keys later.\n');

    const password = await promptPassword('Enter a strong password to encrypt your keys: ');
    const confirmPassword = await promptPassword('Confirm password: ');

    if (password !== confirmPassword) {
        console.error('\n❌ Passwords do not match. Please try again.');
        rl.close();
        return;
    }

    console.log('\nEnter your API keys (leave blank if not using):');

    const openaiKey = await new Promise((resolve) => {
        rl.question('OpenAI API Key: ', resolve);
    });

    const openaiOrgId = await new Promise((resolve) => {
        rl.question('OpenAI Organization ID: ', resolve);
    });

    const mistralKey = await new Promise((resolve) => {
        rl.question('Mistral API Key: ', resolve);
    });

    const apiKeys = {
        openai: openaiKey.trim(),
        openaiOrg: openaiOrgId.trim(),
        mistral: mistralKey.trim(),
        timestamp: new Date().toISOString()
    };

    // Encrypt and save the keys
    const encryptedData = encrypt(apiKeys, password);

    fs.writeFileSync(KEYS_FILE, JSON.stringify(encryptedData, null, 2));

    console.log('\n✅ API keys encrypted and saved successfully!');
    console.log(`📁 Keys stored in: ${KEYS_FILE}`);
    console.log('⚠️  Do not commit this file to your Git repository!');
    console.log('   Add it to your .gitignore if not already present.\n');

    rl.close();
}

/**
 * View stored API keys
 */
async function viewKeys() {
    if (!fs.existsSync(KEYS_FILE)) {
        console.error('\n❌ No encrypted keys found. Run "node encrypt-keys.js save" first.');
        rl.close();
        return;
    }

    console.log('\n🔐 API Key Decryption Tool');
    console.log('-------------------------');

    const password = await promptPassword('Enter your password to decrypt the keys: ');

    try {
        const encryptedData = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
        const decryptedKeys = decrypt(encryptedData, password);

        console.log('\n🔑 Your API Keys:');
        console.log('-------------------------');
        console.log(`OpenAI API Key: ${maskKey(decryptedKeys.openai)}`);
        console.log(`OpenAI Org ID: ${maskKey(decryptedKeys.openaiOrg)}`);
        console.log(`Mistral API Key: ${maskKey(decryptedKeys.mistral)}`);
        console.log('-------------------------');
        console.log(`Encrypted on: ${decryptedKeys.timestamp}`);
        console.log('-------------------------\n');

        const showFull = await new Promise((resolve) => {
            rl.question('Show full unmasked keys? (y/n): ', (answer) => {
                resolve(answer.toLowerCase() === 'y');
            });
        });

        if (showFull) {
            console.log('\n⚠️  FULL API KEYS (Be careful who sees your screen):');
            console.log('-------------------------');
            console.log(`OpenAI API Key: ${decryptedKeys.openai || 'Not set'}`);
            console.log(`OpenAI Org ID: ${decryptedKeys.openaiOrg || 'Not set'}`);
            console.log(`Mistral API Key: ${decryptedKeys.mistral || 'Not set'}`);
            console.log('-------------------------\n');
        }
    } catch (error) {
        console.error(`\n❌ Error: ${error.message}`);
    }

    rl.close();
}

/**
 * Mask a key for display
 * @param {string} key - API key to mask
 * @returns {string} - Masked key
 */
function maskKey(key) {
    if (!key) return 'Not set';

    const firstFour = key.substring(0, 4);
    const lastFour = key.substring(key.length - 4);

    return `${firstFour}${'*'.repeat(Math.min(key.length - 8, 10))}${lastFour}`;
}

/**
 * Print help information
 */
function printHelp() {
    console.log('\n🔐 API Key Encryption Tool');
    console.log('-------------------------');
    console.log('Usage:');
    console.log('  node encrypt-keys.js save   - Store and encrypt API keys');
    console.log('  node encrypt-keys.js view   - View stored API keys');
    console.log('  node encrypt-keys.js help   - Show this help message\n');
    rl.close();
}

// Main function to handle CLI arguments
function main() {
    const args = process.argv.slice(2);
    const command = args[0]?.toLowerCase();

    switch (command) {
        case 'save':
            saveKeys();
            break;
        case 'view':
            viewKeys();
            break;
        case 'help':
        default:
            printHelp();
            break;
    }
}

// Run the tool
main();