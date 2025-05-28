# Coding Standards

## Import Management
- Remove all unused imports
- Use underscore prefix for intentionally unused parameters: `_paramName`
- Group imports by: React, external libraries, internal components, types

## State Management
- Use Zustand for new stores
- Follow the pattern established in useAssistantStore.ts
- Include proper TypeScript types for all state and actions

## Error Handling
- Always include try-catch blocks in async operations
- Log errors using the logger service
- Provide meaningful error messages

## Code Comments
- Add JSDoc comments for complex functions
- Document any workarounds or temporary fixes

# Architecture Decisions

## State Management Migration (Date: 2025-05-24)
- **Decision**: Migrate from MobX State Tree to Zustand
- **Reason**: Simpler API, better TypeScript support, smaller bundle size
- **Impact**: All store files need to be rewritten
- **Migration Strategy**: Create new Zustand stores alongside MST, then switch components
