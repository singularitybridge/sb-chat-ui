# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Development Server:**
```bash
npm run dev          # Start development server on localhost:3000
npm run dev-host     # Start development server accessible on network
```

**Build & Deploy:**
```bash
npm run build        # TypeScript compilation + Vite build
npm run preview      # Preview production build locally
```

**Note:** No linting, testing, or type-checking scripts are available. TypeScript compilation happens during build.

## Architecture Overview

### Hybrid State Management
The application uses a **hybrid architecture** combining two state management patterns:

**Zustand Stores (New):**
- `useSessionStore` - Active chat session management
- `useChatStore` - Chat messages, streaming, and audio
- Located in `src/store/`

**MobX State Tree (Legacy):**
- `RootStore` - Business entities (assistants, companies, users, teams)
- Models in `src/store/models/`
- Context provider in `src/store/common/RootStoreContext.ts`

### Key Data Flow
```
Server API → Services (singleFlight caching) → Zustand/MST Stores → React Components
```

### Service Layer
API services in `src/services/api/` use:
- `singleFlight` utility for request deduplication
- `axios-cache-interceptor` for HTTP caching
- Consistent error handling patterns

### Session & Message Management
- **Sessions**: Zustand store manages active session state
- **Messages**: Zustand store handles chat messages with streaming support
- **Real-time**: Pusher integration for live updates
- **Audio**: TTS integration with audio state management

### Component Architecture
- **Pages**: Top-level route components in `src/pages/`
- **UI Kit**: Reusable components in `src/components/sb-core-ui-kit/`
- **Chat Kit**: Chat-specific components in `src/components/sb-chat-kit-ui/`
- **Admin**: Administrative interfaces in `src/pages/admin/`

### Key Integration Patterns
- **Event Communication**: `mittEmitter` for cross-component events
- **i18n**: React-i18next for internationalization (English/Hebrew RTL)
- **Authentication**: Google OAuth with JWT tokens
- **Real-time**: Pusher for chat messages and notifications

### Teams Feature
Teams organize assistants into logical groups with many-to-many relationships:
- Team assignment/removal through dedicated APIs
- Icon selector using Lucide icons
- Consistent dialog patterns using `DynamicForm` component

### Development Proxy
Vite dev server proxies `/api` requests to `http://localhost:5000` for backend integration.

### Form Handling Pattern
Consistent form implementation using:
1. Field configurations in `src/store/fieldConfigs/`
2. `DynamicForm` component for rendering
3. `DialogFactory` for dialog management
4. Event-driven dialog system

### File Organization
- **Components**: Organized by feature/domain
- **Services**: API layer with consistent patterns  
- **Store**: Split between Zustand (session/chat/audio) and MST (business logic)
- **Utils**: Shared utilities including `singleFlight` for caching and `messageCache`
- **Types**: TypeScript definitions including chat types in `types/chat.ts`

### Recent Improvements
- **Audio Store**: Separated audio logic into dedicated `useAudioStore`
- **Message Caching**: Implemented 5-minute cache for message data
- **Retry Logic**: Added retry utility for session operations
- **Logging Service**: Replaced console.log with proper logging service
- **Error Boundaries**: Enhanced with retry functionality and error IDs
- **Optimistic Updates**: Implemented for assistant changes with rollback