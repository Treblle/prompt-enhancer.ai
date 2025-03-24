# Contributing to AI Prompt Enhancer

## Welcome Contributors! 🌍

Thank you for your interest in contributing to the AI Prompt Enhancer project! It's people like you that make the open-source community such an amazing place to learn, inspire, and create.

## Code of Conduct 🤝

This project and everyone participating in it are governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Environment Setup for Development 🔧

### Setting Up Your Development Environment

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/YOUR-USERNAME/prompt-enhancer.ai.git
   cd prompt-enhancer.ai
   ```

2. **Install dependencies**

   ```bash
   npm install
   cd frontend
   npm install
   cd ..
   ```

3. **Set up environment variables**

   ```bash
   # Run our interactive setup script
   npm run setup
   ```

   The setup script will guide you through creating your local `.env` file and configuring API keys.

### API Keys Security 🔒

**IMPORTANT:** API keys and secrets should never be committed to the repository.

- For local development, your `.env` file is automatically added to `.gitignore` to prevent accidental commits
- For deployment and CI/CD, we use GitHub Secrets (described below)
- When submitting PRs, never include actual API keys in your code or comments

### Setting Up GitHub Secrets for CI/CD (For Maintainers)

If you're a maintainer or setting up your own fork with CI/CD:

1. Go to your GitHub repository
2. Click on "Settings" → "Secrets and variables" → "Actions"
3. Add the following secrets:
   - `API_KEY` - Authentication key for the API
   - `REACT_APP_API_KEY` - SAME AS API_KEY
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `MISTRAL_API_KEY` - Your Mistral AI API key (if using Mistral)

Our GitHub Actions workflows will use these secrets to build and deploy without exposing sensitive data.

## How Can I Contribute? 🚀

### Reporting Bugs 🐛

1. **Ensure the bug is not already reported** by searching existing [Issues](https://github.com/Treblle/prompt-enhancer.ai/issues)
2. If you can't find an existing issue, [open a new one](https://github.com/Treblle/prompt-enhancer.ai/issues/new)
3. Include:
   - A clear title
   - Detailed description
   - Steps to reproduce
   - Expected vs. actual behavior
   - Screenshots (if applicable)
   - Environment details (OS, Node version, etc.)

### Suggesting Enhancements ✨

1. Open an issue with:
   - A clear and descriptive title
   - Detailed explanation of the proposed enhancement
   - Potential benefits
   - Implementation considerations (if you have thoughts)

### Pull Requests Process 🔧

1. Fork the repository
2. Create a feature branch

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. Make your changes

4. Test your changes thoroughly

   ```bash
   npm test
   ```

5. Make sure your code follows our coding guidelines

6. Commit your changes using meaningful commit messages

   ```bash
   git commit -m 'Add: Implement amazing feature'
   ```

7. Push to the branch

   ```bash
   git push origin feature/amazing-feature
   ```

8. Open a Pull Request

9. Wait for review and address any feedback

## Using Act for Testing GitHub Actions Locally 🧪

You can test GitHub Actions workflows locally using [Act](https://github.com/nektos/act).

### Installing Act on Windows

#### Option 1: Using Chocolatey

```bash
choco install act-cli
```

#### Option 2: Using Git Bash with Docker

1. Make sure Docker Desktop is installed and running
2. In Git Bash, run:

```bash
# Download the latest binary
curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | bash
```

#### Option 3: Manual Installation

1. Download the latest release from [GitHub Releases](https://github.com/nektos/act/releases)
2. Extract the executable and place it in a directory in your PATH

### Using Act with GitHub Secrets

To run GitHub Actions workflows locally with secrets:

```bash
# Run the default workflow with secrets
act -s API_KEY=test_key -s OPENAI_API_KEY=test_openai_key

# Run a specific workflow
act push -W .github/workflows/deploy.yml -s API_KEY=test_key
```

## Development Guidelines 📝

### Backend (Node.js)

- Follow ESLint rules
- Use meaningful variable and function names
- Add comments for complex logic
- Write modular, reusable code
- Handle errors gracefully
- Never log sensitive information like API keys

### Frontend (React)

- Use functional components with hooks
- Follow React best practices
- Use Tailwind CSS utility classes
- Keep components small and focused
- Use TypeScript for type safety (recommended)

### Git Commit Messages

- Use clear, descriptive commit messages
- Use the format: `Type: Subject` where Type is one of:
  - `Add:` (new feature)
  - `Fix:` (bug fix)
  - `Docs:` (documentation changes)
  - `Style:` (formatting, no code change)
  - `Refactor:` (refactoring code)
  - `Test:` (adding tests, refactoring tests)
  - `Chore:` (updating build tasks, package manager configs)

## Testing 🧪

- Run existing tests before submitting a PR

  ```bash
  npm test
  ```

- Add tests for new features
- Ensure all tests pass before submitting a PR

## Performance and Security 🔒

- Optimize API calls
- Implement proper error handling
- Never commit sensitive information
- Use environment variables for configuration
- Run security checks before submitting PRs

  ```bash
  npm run security-check
  ```

## Code Review Process 🕵️

1. Maintainers will review PR
2. Feedback and suggestions will be provided
3. Changes may be requested
4. Once approved, PR will be merged

## Financial Contributions 💖

If you want to support the project:

- Star the repository
- Share with your network
- Consider sponsoring via GitHub Sponsors

**Thank you for contributing! Together, we can make AI Prompt Enhancer even more awesome! 🌟**
