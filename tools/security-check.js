#!/usr/bin/env node

/**
 * Security Check Script
 * 
 * This script checks for common security issues in the project,
 * particularly focusing on API key exposure risks.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

// Paths
const rootDir = path.join(__dirname, '..');
const envPath = path.join(rootDir, '.env');
const envExamplePath = path.join(rootDir, '.env.example');
const gitignorePath = path.join(rootDir, '.gitignore');

console.log(`${BLUE}==================================================${RESET}`);
console.log(`${BLUE}            SECURITY CHECK UTILITY                ${RESET}`);
console.log(`${BLUE}==================================================${RESET}\n`);

// ------------------------------------------------------------------
// Check .gitignore configuration
// ------------------------------------------------------------------
console.log(`${BLUE}Checking .gitignore configuration...${RESET}`);
const gitignoreChecks = [
    { file: '.env', description: 'Environment file' },
    { file: '.env.local', description: 'Local environment file' },
    { file: '.env.development.local', description: 'Local development environment' },
    { file: '.env.production.local', description: 'Local production environment' },
    { file: '.secure-keys.json', description: 'Encrypted keys backup' }
];

let gitignoreIssues = false;

if (!fs.existsSync(gitignorePath)) {
    console.log(`${RED}❌ .gitignore file not found!${RESET}`);
    gitignoreIssues = true;
} else {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');

    for (const check of gitignoreChecks) {
        if (!gitignoreContent.includes(check.file)) {
            console.log(`${RED}❌ ${check.file} is not in .gitignore (${check.description})${RESET}`);
            gitignoreIssues = true;
        } else {
            console.log(`${GREEN}✓ ${check.file} correctly excluded${RESET}`);
        }
    }
}

if (!gitignoreIssues) {
    console.log(`${GREEN}✓ .gitignore configuration looks good${RESET}\n`);
} else {
    console.log(`${YELLOW}⚠️ Fix .gitignore issues to prevent accidentally committing sensitive files${RESET}\n`);
}

// ------------------------------------------------------------------
// Check for environment files
// ------------------------------------------------------------------
console.log(`${BLUE}Checking environment files...${RESET}`);

if (!fs.existsSync(envExamplePath)) {
    console.log(`${RED}❌ .env.example file not found!${RESET}`);
} else {
    const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');

    // Check for real API keys in .env.example
    const apiKeyPatterns = [
        { pattern: /sk-[a-zA-Z0-9]{32,}/, description: 'OpenAI API Key' },
        { pattern: /org-[a-zA-Z0-9]{20,}/, description: 'OpenAI Org ID' },
        { pattern: /[a-zA-Z0-9]{32,}/, description: 'Potential API Key' }
    ];

    let exampleIssues = false;

    for (const check of apiKeyPatterns) {
        if (check.pattern.test(envExampleContent)) {
            console.log(`${RED}❌ Possible real ${check.description} found in .env.example${RESET}`);
            exampleIssues = true;
        }
    }

    if (!exampleIssues) {
        console.log(`${GREEN}✓ .env.example does not contain real API keys${RESET}`);
    }
}

if (fs.existsSync(envPath)) {
    console.log(`${GREEN}✓ .env file exists${RESET}`);

    // Check if .env is tracked by git
    try {
        const gitLsOutput = execSync('git ls-files .env', { stdio: ['pipe', 'pipe', 'ignore'] }).toString();

        if (gitLsOutput.includes('.env')) {
            console.log(`${RED}❌ CRITICAL: .env file is tracked by git!${RESET}`);
            console.log(`${YELLOW}   You should remove it from git with: git rm --cached .env${RESET}`);
        } else {
            console.log(`${GREEN}✓ .env file is not tracked by git${RESET}`);
        }
    } catch (error) {
        // Not in a git repository or git command failed
        console.log(`${YELLOW}⚠️ Could not check if .env is tracked by git${RESET}`);
    }
} else {
    console.log(`${YELLOW}⚠️ .env file not found. Run 'npm run setup' to create it${RESET}`);
}

console.log('');

// ------------------------------------------------------------------
// Check Git hooks
// ------------------------------------------------------------------
console.log(`${BLUE}Checking Git hooks configuration...${RESET}`);

try {
    const hooksPath = execSync('git config core.hooksPath', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();

    if (hooksPath) {
        console.log(`${GREEN}✓ Git hooks path is configured: ${hooksPath}${RESET}`);

        const preCommitPath = path.join(rootDir, hooksPath, 'pre-commit');

        if (fs.existsSync(preCommitPath)) {
            const isExecutable = (fs.statSync(preCommitPath).mode & 0o111) !== 0;

            if (isExecutable) {
                console.log(`${GREEN}✓ pre-commit hook is installed and executable${RESET}`);
            } else {
                console.log(`${RED}❌ pre-commit hook exists but is not executable${RESET}`);
                console.log(`${YELLOW}   Run: chmod +x ${preCommitPath}${RESET}`);
            }
        } else {
            console.log(`${RED}❌ pre-commit hook is not installed${RESET}`);
            console.log(`${YELLOW}   Run: npm run install-hooks${RESET}`);
        }
    } else {
        console.log(`${RED}❌ Git hooks path is not configured${RESET}`);
        console.log(`${YELLOW}   Run: npm run install-hooks${RESET}`);
    }
} catch (error) {
    console.log(`${YELLOW}⚠️ Could not check Git hooks configuration${RESET}`);
}

console.log('');

// ------------------------------------------------------------------
// Check for code exposures
// ------------------------------------------------------------------
console.log(`${BLUE}Checking for potential key exposures in code...${RESET}`);

try {
    // Create a list of files to check, excluding node_modules and .git
    const gitFiles = execSync('git ls-files -- "*.js" "*.jsx" "*.json" "*.md" "*.html"', {
        stdio: ['pipe', 'pipe', 'ignore']
    }).toString().trim().split('\n');

    const apiKeyPatterns = [
        { pattern: /sk-[a-zA-Z0-9]{32,}/, description: 'OpenAI API Key' },
        { pattern: /org-[a-zA-Z0-9]{20,}/, description: 'OpenAI Org ID' },
        { pattern: /[a-zA-Z0-9]{32,}(?!\.[\w-]+)/, description: 'Potential API Key (32+ chars)' },
        { pattern: /api[_-]?key\s*[=:]\s*['"][^'"]+['"]/, description: 'API key assignment' },
        { pattern: /secret\s*[=:]\s*['"][^'"]+['"]/, description: 'Secret assignment' }
    ];

    const excludePatterns = [
        /keyManager\.js$/,
        /encrypt-keys\.js$/,
        /setup-env\.js$/,
        /security-check\.js$/,
        /node_modules\//
    ];

    let foundExposures = false;

    for (const file of gitFiles) {
        // Skip excluded files
        if (excludePatterns.some(pattern => pattern.test(file))) {
            continue;
        }

        try {
            const content = fs.readFileSync(path.join(rootDir, file), 'utf8');

            for (const { pattern, description } of apiKeyPatterns) {
                if (pattern.test(content)) {
                    console.log(`${RED}❌ Possible ${description} found in ${file}${RESET}`);
                    foundExposures = true;
                }
            }
        } catch (error) {
            console.log(`${YELLOW}⚠️ Could not check file: ${file}${RESET}`);
        }
    }

    if (!foundExposures) {
        console.log(`${GREEN}✓ No obvious API key exposures found in code${RESET}`);
    }
} catch (error) {
    console.log(`${YELLOW}⚠️ Could not check for API key exposures: ${error.message}${RESET}`);
}

console.log('');

// ------------------------------------------------------------------
// Summary
// ------------------------------------------------------------------
console.log(`${BLUE}==================================================${RESET}`);
console.log(`${BLUE}                  SUMMARY                         ${RESET}`);
console.log(`${BLUE}==================================================${RESET}\n`);

console.log(`${YELLOW}Key Security Reminders:${RESET}`);
console.log(`${YELLOW}1. Never commit API keys or secrets to Git${RESET}`);
console.log(`${YELLOW}2. Use environment variables for sensitive data${RESET}`);
console.log(`${YELLOW}3. Regularly rotate your API keys${RESET}`);
console.log(`${YELLOW}4. Keep your .env file secure and local${RESET}`);
console.log(`${YELLOW}5. Use the encrypted backup feature for safekeeping${RESET}`);

console.log(`\n${BLUE}Helpful Commands:${RESET}`);
console.log(`${GREEN}npm run setup${RESET}           - Set up your environment securely`);
console.log(`${GREEN}npm run encrypt-keys${RESET}    - Back up your keys securely`);
console.log(`${GREEN}npm run install-hooks${RESET}   - Install git hooks to prevent key commits`);

console.log(`\n${BLUE}==================================================${RESET}`);
console.log(`${BLUE}       Security check completed                   ${RESET}`);
console.log(`${BLUE}==================================================${RESET}\n`);