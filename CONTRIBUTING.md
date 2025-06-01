# Contributing to Singularity Bridge Chat UI

We love your input! We want to make contributing to Singularity Bridge Chat UI as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## Pull Requests

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Any contributions you make will be under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using GitHub's [issue tracker](../../issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](../../issues/new); it's that easy!

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Development Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup

1. Clone your fork of the repository:
```bash
git clone https://github.com/yourusername/sb-chat-ui.git
cd sb-chat-ui
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Copy the environment example file and configure:
```bash
cp .env-sample .env
```

4. Set up your environment variables in the `.env` file.

5. Start the development server:
```bash
npm run dev
# or
yarn dev
```

### Running Tests

Currently, the project is using basic linting. Run the linter:
```bash
npm run lint
# or
yarn lint
```

### Code Style

We use ESLint for code formatting. Before submitting a PR:

```bash
npm run lint
# or
yarn lint
```

## Coding Standards

- Use TypeScript for all new code
- Follow React best practices
- Write clear, descriptive variable and function names
- Use functional components with hooks
- Keep components small and focused
- Use proper TypeScript types

## Project Structure

```
├── src/
│   ├── components/         # Reusable React components
│   ├── pages/             # Page components
│   ├── services/          # API services and utilities
│   ├── store/             # MobX state management
│   ├── utils/             # Utility functions
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
├── docs/                  # Documentation
└── dist/                  # Build output
```

## Component Guidelines

When creating new components:

1. Use TypeScript with proper type definitions
2. Follow the existing component structure
3. Add proper JSDoc comments for props and functions
4. Use consistent naming conventions
5. Include proper error handling
6. Make components responsive and accessible

## Adding New Features

When adding new features:

1. Create a new branch for your feature
2. Follow the existing code patterns
3. Add proper TypeScript types
4. Update documentation as needed
5. Test your changes thoroughly

## Documentation

- Keep the README up to date
- Document new components and features
- Use clear, concise language
- Include code examples where helpful
- Update the docs/ folder for major features

## Questions?

Feel free to open an issue with your question or reach out to the maintainers directly.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
