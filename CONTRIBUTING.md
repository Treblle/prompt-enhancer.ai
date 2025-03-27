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

   The setup script will guide you through creating your local `.env` file, generating a random API key for development use, and creating a secure JWT secret for authentication.

### Authentication and Security 🔒

Our project uses JWT-based authentication for improved security:

- **Development Environment**: The setup script generates a random API key and JWT secret for local use
- **Production Environment**: API keys and JWT secrets are stored as environment variables in GitHub Actions and Vercel
- **Authentication Flow**: The frontend obtains a JWT token which is used for all API requests
- **Token Management**: JWT tokens expire after 24 hours (configurable) and are automatically refreshed

**IMPORTANT:**

- Never commit API keys or JWT secrets to the repository
- Use only environment variables for sensitive data
- When contributing, ensure your changes adhere to the JWT authentication flow

### API Keys Security 🔒

**IMPORTANT:** API keys and JWT secrets should never be committed to the repository.

- For local development, your `.env` file is automatically added to `.gitignore` to prevent accidental commits
- For deployment and CI/CD, use GitHub Secrets and Vercel Environment Variables
- When submitting PRs, never include actual API keys or JWT secrets in your code or comments
- Never hardcode sensitive credentials in the source code

### API Monitoring with Treblle 📊

The project uses Treblle for API monitoring and observability, but only in the production environment:

- **Development**: Treblle is disabled by default in local environments
- **Production**: Treblle automatically logs all API requests made to the production server

When working in development mode, you don't need to configure Treblle credentials. For production deployment, Treblle API keys are managed through GitHub Secrets and Vercel Environment Variables.

### Setting Up GitHub Secrets for CI/CD (For Maintainers)

If you're a maintainer or setting up your own fork with CI/CD:

1. Go to your GitHub repository
2. Click on "Settings" → "Secrets and variables" → "Actions"
3. Add the following secrets:
   - `API_KEY` - A strong, randomly generated API key
   - `JWT_SECRET` - A strong, random secret for JWT token generation
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `MISTRAL_API_KEY` - Your Mistral AI API key (if using Mistral)
   - `TREBLLE_API_KEY` - Your Treblle API key for API monitoring
   - `TREBLLE_PROJECT_ID` - Your Treblle project ID for API monitoring

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

## Development Guidelines 📝

### Backend (Node.js)

- Follow ESLint rules
- Use meaningful variable and function names
- Add comments for complex logic
- Write modular, reusable code
- Handle errors gracefully
- Never log sensitive information like API keys or JWT secrets
- **IMPORTANT:** Never hardcode API keys or JWT secrets - always use environment variables

### Authentication Implementation

When working with the authentication system:

- Always use the `authenticateToken` middleware for new routes
- Use the `authService` for token generation and validation
- Keep the JWT secret secure in environment variables
- Set reasonable token expiration times
- Implement proper error handling for authentication failures

### Frontend (React)

- Use functional components with hooks
- Follow React best practices
- Use Tailwind CSS utility classes
- Keep components small and focused
- Use TypeScript for type safety (recommended)
- Ensure mobile responsiveness
- Use the authentication service for token management
- Never embed API keys in frontend code - use the token-based approach

## Local HTTPS Development

For secure local development:

1. Generate self-signed certificates:

   ```bash
   mkdir -p certificates
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout certificates/key.pem -out certificates/cert.pem

### Security Best Practices

- Always use environment variables for sensitive data
- Never commit `.env` files or files containing keys and secrets
- Use the pre-commit hooks to prevent accidental key exposure
- Regularly run `npm run security-check` to detect potential issues
- Use encrypted storage for backups of sensitive information
- Follow the principle of least privilege for API access
- Use HTTPS for all API communications

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

**Thank you for contributing! Together, we can make AI Prompt Enhancer even more awesome! 🌟**
