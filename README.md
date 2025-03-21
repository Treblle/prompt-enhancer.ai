# AI Prompt Enhancer 🚀

## Overview

AI Prompt Enhancer is designed to transform basic prompts into optimized, high-quality instructions for AI language models.

## 🌟 Features

- **Intelligent Prompt Enhancement**: Convert basic prompts into structured, context-rich instructions.
- **Multi-AI Provider Support**: Works with both Mistral and OpenAI.
- **Open Source**: Completely customizable and community-driven.
- **Security-Focused**: Built with API key protection as a priority.

## 🛠 Tech Stack

- **Frontend**:
  - React
  - Tailwind CSS
  - Radix UI Components

- **Backend**:
  - Node.js
  - Express.js

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
- Guides you through adding your API keys
- Installs security measures to prevent key exposure

### Encrypting Your Keys (OPTIONAL)

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

## 🔐 Environment Configuration

The project uses `.env` files for configuration. For required variables, refer to `.env.example`.

### Backend Environment Variables

- `PORT`: Server port
- `AI_PROVIDER`: Choose between 'mistral' or 'openai'
- `MISTRAL_API_KEY`: Mistral AI API key
- `OPENAI_API_KEY`: OpenAI API key
- `API_KEY`: Authentication key for the API

### Frontend Environment Variables

- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_API_KEY`: API authentication key

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.


# Powered By Treblle

Treblle](https://treblle.com) is an API Intelligence platform that empowers companies looking to connect the dots between APIs and their business development.

<div align="center">
  <img src="https://github.com/user-attachments/assets/54f0c084-65bb-4431-b80d-cceab6c63dc3"/>
</div>

**Happy Prompting! 🎉**
