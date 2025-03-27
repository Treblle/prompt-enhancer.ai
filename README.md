# AI Prompt Enhancer 🚀

## Overview

AI Prompt Enhancer is designed to transform basic prompts into optimized, high-quality instructions for AI language models. By structuring and enhancing their initial prompts, this tool helps users get better results from interactions with models like Claude, ChatGPT, and Gemini.

## 🌟 Features

- **Intelligent Prompt Enhancement**: Convert basic prompts into structured, context-rich instructions
- **Multi-AI Provider Support**: Works with both Mistral and OpenAI (configurable through simple environment settings)
- **Open Source**: Completely customizable and community-driven
- **Security-Focused**: Built with API key protection as a priority
- **Mobile-Friendly**: Responsive design optimized for all devices
- **API-Driven**: Use the REST API directly or via the frontend UI

## 🛠 Tech Stack

- **Frontend**:
  - React 19
  - Tailwind CSS
  - Radix UI Components

- **Backend**:
  - Node.js
  - Express.js
  - Rate limiting and DDoS protection built-in

- **AI Providers**:
  - Mistral AI
  - OpenAI

## 📦 Prerequisites

- Node.js (v16+ recommended)
- npm or yarn
- API keys for Mistral AI or OpenAI
  
## 🚀 Quick Start

### Local Development

1. Clone the repository

   ```bash
   git clone https://github.com/Rahulkhinchi03/prompt-enhancer.ai.git
   cd prompt-enhancer.ai
   ```

2. Setup Frontend

   ```bash
   cd frontend
   npm install
   ```

2. Setup Backend

   ```bash
   cd ..
   npm install
   npm run setup
   ```

4. Run the Application

   ```bash
   npm run dev  # Starts both frontend and backend
   ```

### Setting Up Environment Variables

The `npm run setup` command helps you securely configure your environment:

- Creates a `.env` file based on `.env.example`
- Generates a random API key for development use
- Guides you through adding your AI provider API keys
- Installs security measures to prevent key exposure

### API Key Management

The application uses different API keys for different environments:

- **Development & Local**: A unique randomly generated API key for each developer's environment
- **Production**: API keys stored securely as environment variables in your deployment platform (GitHub Actions/Vercel)

No API keys are hardcoded in the codebase for improved security.

### Important Note on API Keys

**DO NOT COMMIT API KEYS TO THE REPOSITORY**. Set all keys as environment variables:

- For development: Use the `.env` file (automatically ignored by Git)
- For production: Set keys in GitHub Secrets and Vercel Environment Variables

### Encrypting Your Keys

For additional security, you can encrypt your API keys:

```bash
npm run encrypt-keys save  # Create encrypted backup
npm run encrypt-keys view  # View your stored keys
```

This creates an encrypted file that requires a password to access.

### Security Checks

Run security checks to ensure your repository is properly configured:

```bash
npm run security-check
```

### ⚠️ IMPORTANT

**Never commit API keys to Git repositories**. We've implemented multiple safeguards:

- Pre-commit hooks to catch accidental key commits
- Git ignorance of sensitive files
- Validation checks on startup
- Security checks to detect key exposure

## 🔐 Environment Configuration

The project uses `.env` files for configuration. For required variables, refer to `.env.example`.

### Backend Environment Variables

- `PORT`: Server port
- `NODE_ENV`: Environment (development, production, test)
- `AI_PROVIDER`: Choose between 'mistral' or 'openai'
- `MISTRAL_API_KEY`: Mistral AI API key
- `OPENAI_API_KEY`: OpenAI API key
- `API_KEY`: Authentication key for the API

### Frontend Environment Variables

- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_API_KEY`: API authentication key (synchronized with backend)

## 🔄 Environment Differences

- **Development**: Random API keys, debug logging, localhost services
- **Production**: API keys from environment variables, minimal logging, production-optimized services

## 📚 API Documentation

The API is documented using OpenAPI and is available at `/docs` when running the server.

### API Endpoints

- `POST /v1/prompts`: Enhance a prompt
- `GET /v1/prompts`: List enhanced prompts
- `GET /v1/prompts/:id`: Get a specific enhanced prompt
- `PUT /v1/prompts/:id`: Update a specific prompt
- `DELETE /v1/prompts/:id`: Delete a specific prompt

### Example API Usage

```javascript
// Example: Enhance a prompt using the API
fetch('https://prompt-enhancer.ai/v1/prompts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key' // Use the API key from your environment
  },
  body: JSON.stringify({
    text: 'Write about quantum computing',
    format: 'structured'
  })
})
.then(response => response.json())
.then(data => console.log(data.enhancedText));
```

## 🧪 Testing

Run tests using the following commands:

```bash
npm test              # Run all tests
npm run test:unit     # Run unit tests
npm run test:security # Run security tests
```

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

# Powered By Treblle

[Treblle](https://treblle.com) is an API Intelligence platform that empowers companies looking to connect the dots between APIs and their business development.

<div align="center">
  <img src="https://github.com/user-attachments/assets/54f0c084-65bb-4431-b80d-cceab6c63dc3"/>
</div>

## 📞 Support

Encounter an issue? [Open an issue](https://github.com/Treblle/prompt-enhancer/issues) on GitHub.

---

**Happy Prompting! 🎉**
