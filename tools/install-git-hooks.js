#!/usr/bin/env node

/**
 * Git Hooks Installation Script
 * 
 * This script installs custom git hooks to help prevent committing sensitive data
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const hooksDir = path.join(__dirname, '../.git-hooks');
const gitDir = path.join(__dirname, '../.git');
const gitHooksDir = path.join(gitDir, 'hooks');

// Check if .git directory exists
if (!fs.existsSync(gitDir)) {
    console.warn('⚠️ .git directory not found. Skipping git hooks installation in this environment.');
    process.exit(0); // Exit successfully instead of with an error
}

// Check if custom hooks directory exists
if (!fs.existsSync(hooksDir)) {
    console.error('❌ .git-hooks directory not found. Please create it first.');
    process.exit(1);
}

// Create git hooks directory if it doesn't exist
if (!fs.existsSync(gitHooksDir)) {
    fs.mkdirSync(gitHooksDir, { recursive: true });
    console.log('✅ Created git hooks directory');
}

// Install hooks
const hooks = ['pre-commit'];

hooks.forEach(hook => {
    const sourcePath = path.join(hooksDir, hook);
    const destPath = path.join(gitHooksDir, hook);

    // Check if source hook exists
    if (!fs.existsSync(sourcePath)) {
        console.error(`❌ Hook file not found: ${sourcePath}`);
        return;
    }

    // Copy hook file
    fs.copyFileSync(sourcePath, destPath);

    // Make executable
    fs.chmodSync(destPath, '755');

    console.log(`✅ Installed ${hook} hook`);
});

// Configure git to use the hooks
try {
    execSync('git config core.hooksPath .git/hooks');
    console.log('✅ Configured git to use the hooks');
} catch (error) {
    console.error('❌ Failed to configure git hooks:', error.message);
}

console.log('\n🎉 Git hooks installation complete!');
console.log('Your repository is now protected against accidental key commits.');