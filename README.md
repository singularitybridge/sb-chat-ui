# Singularity Bridge Chat UI

This is the frontend application for Singularity Bridge, a platform for managing AI assistants.

## Features

- **Companies Management**: Create and manage companies
- **Assistants Management**: Create and manage AI assistants
- **Users Management**: Create and manage users
- **Sessions Management**: View and manage chat sessions
- **Teams Management**: Organize assistants into logical groups
- **Actions Management**: Create and manage custom actions for assistants
- **Chat Interface**: Interact with AI assistants

## Teams Feature

The Teams feature allows you to organize AI assistants into logical groups. Each team can have multiple assistants, and each assistant can belong to multiple teams.

For more information about the Teams feature, see [Teams Feature Documentation](docs/teams-feature.md).

## Development

### Prerequisites

- Node.js
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Running the Application

```bash
# Start the development server
npm run dev
```

### Building for Production

```bash
# Build the application
npm run build
```

## Project Structure

- `src/`: Source code
  - `components/`: React components
  - `pages/`: Page components
  - `services/`: Service classes
  - `store/`: MobX state management
  - `utils/`: Utility functions
- `public/`: Static assets
- `docs/`: Documentation

## Documentation

- [Teams Feature](docs/teams-feature.md)
- [Teams Management Implementation](docs/teams-management.md)
