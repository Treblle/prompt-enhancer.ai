# AI Prompt Enhancer 🚀

## Overview

AI Prompt Enhancer is designed to transform basic prompts into optimized, high-quality instructions for AI language models. By structuring and enhancing their initial prompts, this tool helps users get better results from interactions with models like Claude, ChatGPT, and Gemini.

## 🌟 Features

- **Intelligent Prompt Enhancement**: Convert basic prompts into structured, context-rich instructions
- **Multi-AI Provider Support**: Works with both Mistral and OpenAI (configurable through simple environment settings)
- **Open Source**: Completely customizable and community-driven
- **Security-Focused**: Built with JWT-based authentication for improved security
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
  - JWT authentication
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
- Generates a secure JWT secret for token-based authentication
- Guides you through adding your AI provider API keys
- Installs security measures to prevent key exposure

### Authentication System

The application uses JWT (JSON Web Token) for authentication:

- **Secure Authentication Flow**: The API key is used only to generate a short-lived token
- **Token-Based Access**: All API requests use tokens instead of API keys
- **Automatic Token Management**: The frontend handles token acquisition and refresh automatically
- **Secure Communication**: Sensitive credentials are never exposed in network requests

For development, the authentication system uses environment variables defined in your `.env` file. For production, these variables are securely stored in your deployment platform.

### Important Note on Security

**DO NOT COMMIT API KEYS OR JWT SECRETS TO THE REPOSITORY**. Set all keys and secrets as environment variables:

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

## 🔐 Environment Configuration

The project uses `.env` files for configuration. For required variables, refer to `.env.example`.

### Backend Environment Variables

- `PORT`: Server port
- `NODE_ENV`: Environment (development, production, test)
- `API_KEY`: Authentication key for the API
- `JWT_SECRET`: Secret key for JWT token generation
- `JWT_EXPIRY`: Token expiration time (e.g., "24h")
- `AI_PROVIDER`: Choose between 'mistral' or 'openai'
- `MISTRAL_API_KEY`: Mistral AI API key
- `OPENAI_API_KEY`: OpenAI API key

### Frontend Environment Variables

- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_API_KEY`: API authentication key (used only for initial token generation)

## 🔄 Environment Differences

- **Development**: Random API keys, debug logging, localhost services
- **Production**: API keys from environment variables, minimal logging, production-optimized services

## 📚 API Documentation

The API is documented using OpenAPI and is available at `/docs` when running the server.

### API Endpoints

#### Authentication Endpoints

- `POST /v1/auth/token`: Generate a JWT token for authentication

#### Prompt Endpoints

- `POST /v1/prompts`: Enhance a prompt
- `GET /v1/prompts`: List enhanced prompts
- `GET /v1/prompts/:id`: Get a specific enhanced prompt
- `PUT /v1/prompts/:id`: Update a specific prompt
- `DELETE /v1/prompts/:id`: Delete a specific prompt

### Example API Usage

```javascript
// Example: Generate a token for authentication
async function getAuthToken() {
  const response = await fetch('https://prompt-enhancer.ai/v1/auth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      clientId: 'your-client-id',
      clientSecret: 'your-api-key' // Use the API key from your environment
    })
  });
  
  const data = await response.json();
  return data.access_token;
}

// Example: Enhance a prompt using JWT authentication
async function enhancePrompt(text) {
  // Get token
  const token = await getAuthToken();
  
  // Use token for API request
  const response = await fetch('https://prompt-enhancer.ai/v1/prompts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      text: text,
      format: 'structured'
    })
  });
  
  const data = await response.json();
  return data.enhancedText;
}
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
