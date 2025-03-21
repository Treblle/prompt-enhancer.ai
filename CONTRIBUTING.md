# Contributing to AI Prompt Enhancer

## Welcome Contributors! 🌍

People like you make the open-source community such an amazing place to learn, inspire, and create.

## Code of Conduct 🤝

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

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

### Pull Requests 🔧

1. Fork the repository
2. Create a feature branch

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. Commit your changes

   ```bash
   git commit -m 'Add some amazing feature'
   ```

4. Push to the branch

   ```bash
   git push origin feature/amazing-feature
   ```

5. Open a Pull Request

## Development Setup 💻

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Git

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

## Coding Guidelines 📝

### Backend (Node.js)

- Follow ESLint rules
- Use meaningful variable and function names
- Add comments for complex logic
- Write modular, reusable code
- Handle errors gracefully

### Frontend (React)

- Use functional components with hooks
- Follow React best practices
- Use Tailwind CSS utility classes
- Keep components small and focused
- Use TypeScript for type safety (recommended)

### Git Commit Messages

- Use clear, descriptive commit messages
- Use present tense
- Use the imperative mood
- Limit the first line to 72 characters
- Reference issue numbers when applicable

## Testing 🧪

- Run existing tests before submitting a PR

  ```bash
  npm test
  ```

- Add tests for new features
- Ensure 100% test coverage for new code

## Performance and Security 🔒

- Optimize API calls
- Implement proper error handling
- Never commit sensitive information
- Use environment variables for configuration

## Code Review Process 🕵️

1. Maintainers will review PR
2. Feedback and suggestions will be provided
3. Changes may be requested
4. Once approved, PR will be merged

**Thank you for contributing! Together, we can make AI Prompt Enhancer even more awesome! 🌟**
