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
- **Real-time**: Socket.IO integration for live updates
- **Audio**: TTS integration with audio state management

### Component Architecture
- **Pages**: Top-level route components in `src/pages/`
- **UI Kit**: Reusable components in `src/components/sb-core-ui-kit/`
- **Chat Kit**: Chat-specific components in `src/components/sb-chat-kit-ui/`
- **Admin**: Administrative interfaces in `src/pages/admin/`

### Key Integration Patterns
- **Event Communication**: `mittEmitter` for cross-component events
- **i18n**: React-i18next for internationalization (English/Hebrew RTL)
- **Authentication**: Clerk authentication with JWT tokens
- **Real-time**: Socket.IO for chat messages and notifications

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

### Layout & Overflow Handling
When dealing with flexbox overflow issues where content gets cut off:
- **Root Cause**: Flex items have an implicit `min-width: auto` which prevents them from shrinking below their content size
- **Solution**: Add `min-w-0` to flex containers that need to shrink to prevent overflow
- **Example**: In `AssistantsPage.tsx`, the chat container wrapper uses `grow min-w-0` to properly contain long text
- **Avoid**: Adding multiple overflow classes or max-width constraints when the issue is flex shrinking
- **Key Pattern**: Let flexbox handle sizing naturally - just ensure containers can shrink with `min-w-0`

## Screen Sharing & File Upload Features

### Drag & Drop File Upload
- **Location**: `ChatInput.tsx` component
- **Features**: Visual drag overlay, file validation, multiple file support
- **File Types**: Images, videos, PDFs, documents, CSV, JSON, audio files
- **Preview**: Uses `FilePreview` component with file type icons

### Screen Share Workspace
- **Route**: `/screenshare/:workspace` (e.g., `/screenshare/home`)
- **Component**: `src/pages/ScreenShareWorkspace.tsx`
- **Layout**: Three equal columns - Chat | Screen Preview | Agent Workspace
- **Features**:
  - Automatic screenshot capture when sending messages
  - Live screen preview with video element
  - Full chat history with SBChatKitUI component
  - MDX-rendered workspace content
  - Session-independent workspace URLs

### Screen Sharing Implementation
- **Store**: `useScreenShareStore` (Zustand)
- **Screenshot Naming**: `{sessionId}-screenshare.png`
- **Upload Flow**:
  1. Capture screenshot via `getDisplayMedia` API
  2. Upload to `/content-file/upload` with `title` field (required)
  3. Get `gcpStorageUrl` from response
  4. Send to assistant via `/assistant/user-input` with attachment metadata
- **Important**: ChatInput skips auto-capture in workspace (checks `window.location.pathname.includes('/screenshare/')`)

### File Upload Service
- **Endpoint**: `/content-file/upload`
- **Required Fields**: `file` (FormData), `title` (string)
- **Response**: Contains `gcpStorageUrl` for file access
- **Utility**: Use `createFileMetadata()` from `fileUtils.ts` for consistency

### Visual Design Patterns
- **App Background**: Uses `DynamicBackground` component with Midjourney image
- **Floating Containers**: `rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg`
- **No Borders**: Use shadows and backgrounds for separation
- **Color Scheme**: Gradients, translucent overlays, dark background pattern
- **Typography**: Consistent sizing, proper hierarchy
- **Model Indicator**: Reusable `ModelIndicator` component shows LLM provider icon and model name
  - Located in `src/components/ModelIndicator.tsx`
  - Supports sizes: small, medium, large
  - Can display with or without badge styling
  - Automatically shortens model names and detects providers (OpenAI, Anthropic, Gemini)
- **Chat Header Icons**: Use `w-5 h-5` size for action buttons (copy, settings, screen share, clear)
- **Integration Display**: Show integration icons below assistant description in chat header

### Session Management for Workspace
- **Requirement**: Active session needed for screen share workspace
- **Check**: Workspace shows "No Active Session" message if no assistant selected
- **Navigation**: Must select assistant from `/admin/assistants` first
- **State**: Uses `activeSession` from `useSessionStore`

### API Integration Notes
- **Authorization**: Use `Bearer ${localStorage.getItem('userToken')}`
- **Base URL**: Use `import.meta.env.VITE_API_URL` (not hardcoded localhost)
- **Error Handling**: Always provide fallback for failed uploads

### MDX Content Rendering
- **Component**: `MDXRenderer` from `sb-core-ui-kit`
- **Styling**: Wrap in div with `prose` class for proper markdown styling
- **HTML in MDX**: Use JSX syntax, not HTML strings (MDX parser handles JSX)
- **Dynamic Content**: Can include session data, metrics, and real-time info

## AI Cost Tracking Feature

### Overview
Comprehensive cost analytics dashboard replacing the sessions menu, providing real-time visibility into AI usage costs.

### Architecture
- **Location**: `/admin/costs` (replaced `/admin/sessions`)
- **Main Component**: `CostTrackingDashboard` in `src/components/cost-tracking/`
- **Data Layer**: TypeScript interfaces in `src/types/costTracking.ts`
- **API Service**: `src/services/api/costTrackingService.ts` with singleFlight caching
- **Custom Hooks**: `src/hooks/useCostData.ts` for data fetching

### Core Components
1. **MetricsCards**: Overview stats (total cost, requests, tokens, avg response time)
2. **UsageChart**: Interactive Recharts visualizations (area, line, bar charts)
3. **CostTable**: Sortable/filterable table with pagination using @tanstack/react-table
4. **AssistantCostGrid**: Grid view of per-assistant costs and metrics
5. **ModelComparison**: Model performance analytics with pie/bar charts

### Features
- **Real-time Updates**: Auto-refresh every 30 seconds
- **Filtering**: Date range, provider (OpenAI/Anthropic/Google), model, assistant
- **Export**: CSV download of cost records
- **Responsive**: Mobile-optimized layouts
- **Tabs**: Overview, Assistants, Models, Details views

### API Endpoints (Backend)
- `GET /api/costs/summary` - Aggregated cost data
- `GET /api/costs` - Detailed cost records with filtering
- `GET /api/costs/daily` - Daily cost trends
- `GET /api/costs/by-assistant/:id` - Assistant-specific costs
- `GET /api/costs/by-model/:model` - Model-specific costs

### Recharts Integration
- Fixed TypeScript issues with type assertions (`as any`)
- Components: ResponsiveContainer, LineChart, BarChart, AreaChart, PieChart
- Custom tooltips with cost formatting
- Gradient fills for visual appeal

### State Management
- Uses Zustand hooks for session data
- Local component state for filters and UI
- singleFlight for request deduplication

### Navigation Update
- Menu item: "AI Costs" (was "Sessions")
- Translations: English "AI Costs", Hebrew "עלויות AI"
- Route: `/admin/costs` (was `/admin/sessions`)
## Code Sample Dialog Feature

### Overview
A comprehensive code sample generator dialog accessible via a button in the chat header (between Copy and Settings buttons). Provides code samples for integrating with the assistant's stateless execute API endpoint.

### Location
- **Component**: `src/components/CodeSampleDialog.tsx`
- **Integration**: Added to `src/components/sb-chat-kit-ui/chat-elements/Header.tsx`

### Features

#### Language Support
- **JavaScript**: Modern async/await fetch implementation
- **Python**: Using requests library
- **cURL**: Command-line examples
- Uses Simple Icons from `react-icons/si` for professional language logos

#### API Endpoint
- **Route**: `/assistant/:assistantId/execute` (singular 'assistant', not 'assistants')
- **Type**: Stateless execution without session management
- **Auth**: Bearer token authentication

#### Options
- **File Upload**: Example with base64 encoded data
- **URL Attachment**: Example with external URL
- **Prompt Override**: Custom system prompt support

#### Test Feature
- **Live Testing**: Built-in API test functionality
- **Custom Input**: Users can enter test messages
- **Real-time Results**: Shows API response in split view
- **Error Handling**: Displays errors if API call fails

### UI Design
- **Minimal Design**: Ultra-clean interface with icon-only controls
- **Brand Colors**: Purple (#7C3AED) for active states (agent portal color)
- **Segmented Controls**: iOS-style language selector
- **Compact Layout**: Smaller dialog (max-w-2xl) with tight spacing

### Code Generation
- Generates working code samples based on selected language and options
- Properly formats API URLs and authentication headers
- Includes appropriate error handling for each language
- No streaming support (simplified implementation)

### Important Notes
- Always use singular `/assistant/` in the route, not `/assistants/`
- Test feature excludes file attachments for simplicity
- Code samples are for stateless execute endpoint only (no session management)

## Documentation Maintenance

### Updating Docs Before Pushing
**IMPORTANT**: Before pushing significant changes to remote, update the documentation project:

1. Navigate to `/Users/avio/dev/sb/sb-docs`
2. Update `/docs/changelog.md` with your changes under `[Unreleased]`
3. Update relevant documentation pages if UI/features changed
4. Run `npm run build` to verify no broken links

### Categories for Changelog
- **Added** - New features, components, pages
- **Changed** - Modified behavior, UI changes, refactoring
- **Fixed** - Bug fixes
- **Removed** - Deprecated components
- **Security** - Security improvements
