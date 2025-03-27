# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Prompt Enhancer, please follow these steps:

1. **Do not disclose the vulnerability publicly** until it has been addressed by the maintainers.
2. Email your findings to [security@prompt-enhancer.ai](mailto:security@prompt-enhancer.ai).
3. Include detailed information about the vulnerability:
   - Description of the issue
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
4. Allow time for the maintainers to address the issue before disclosing it to others.

## Security Best Practices

### API Key Management

- **Never commit API keys to the repository**
- Store all API keys and secrets as environment variables
- For development, use the `.env` file (automatically gitignored)
- For production, set keys in your deployment platform (GitHub Secrets, Vercel Environment Variables)
- Rotate API keys regularly (recommended every 90 days)
- Use the encrypted key backup feature for safekeeping:

  ```bash
  npm run encrypt-keys save
  ```

### Authentication

The application uses JWT-based authentication:

- Tokens expire after 24 hours (configurable)
- Use the provided authentication middleware for all new routes
- Client-side tokens are stored in localStorage (clear on logout)
- Authentication failures are rate-limited to prevent brute-force attacks

### Input Validation

- All user inputs must be validated using the validator middleware
- Text inputs must be sanitized to prevent XSS attacks
- Apply length limits to prevent payload attacks
- Use parameterized queries for database operations (when applicable)

### Rate Limiting

- All API endpoints are protected by rate limiting
- Different limits apply based on authentication status and endpoint sensitivity
- Production environments use Redis-backed rate limiting when available
- Configure custom rate limits in `src/config/config.js`

### HTTPS and Security Headers

- HTTPS is enforced in production environments
- Security headers are applied using Helmet.js
- Custom security headers are applied for specific routes
- CSP directives restrict resource loading to approved sources only

### Dependency Security

- Run security scans on dependencies regularly:

  ```bash
  npm run security:check
  ```

- Review and update dependencies with known vulnerabilities
- The CI pipeline automatically checks for vulnerable dependencies

### AI Prompt Security

- All prompts are sanitized to prevent prompt injection attacks
- Sensitive information is removed from prompts
- Control tokens and boundaries prevent injection attacks
- AI provider API keys are never exposed to clients

## Security Checks

Run the included security checks to ensure your development environment is secure:

```bash
npm run security-check
```

This will:

- Check your `.gitignore` configuration
- Verify that no sensitive files are tracked by git
- Check that environment variables are properly configured
- Scan for potential API key exposures in code

## Pre-Commit Hooks

Git hooks are installed automatically to prevent committing sensitive data:

- API keys and tokens are detected and blocked
- Environment files (.env) are prevented from being committed
- To bypass hooks in exceptional cases: `git commit --no-verify` (use with caution)

## Production Deployment

Before deploying to production:

1. Set up proper HTTPS with valid certificates
2. Configure environment variables in your deployment platform
3. Enable rate limiting and DDoS protection
4. Run a final security scan
5. Ensure logging excludes sensitive information

## Security Monitoring

- API monitoring is handled by Treblle in production environments
- Error logs exclude sensitive information
- Rate limit and authentication failures are logged for monitoring
- Regular security audits should be performed

## Third-Party Services

When using third-party AI services:

- Always use dedicated API keys with minimal permissions
- Monitor API key usage for unexpected patterns
- Rotate keys if suspicious activity is detected
- Never share API keys between environments

## Local Development Security

For secure local development:

1. Always use the setup script to create your environment:

   ```bash
   npm run setup
   ```

2. Keep your local `.env` file secure and never share it
3. Use the encrypted backup feature for key recovery
4. Run the security checker regularly:

   ```bash
   npm run security-check
   ```

## Compliance Considerations

This application processes user inputs and leverages AI services, which may have regulatory implications:

- Ensure GDPR compliance when handling user data
- Consider whether AI outputs require content moderation
- Evaluate whether your use of AI services complies with their terms of service
- Implement appropriate data retention policies

## Version History

| Version | Supported          | Notes                                   |
| ------- | ------------------ | --------------------------------------- |
| 1.0.x   | :white_check_mark: | Current version                         |
| < 1.0   | :x:                | Initial development versions (insecure) |
