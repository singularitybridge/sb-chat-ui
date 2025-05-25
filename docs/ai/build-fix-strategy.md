# Build and Lint Error Fix Strategy

This document outlines the strategy to fix the lint and build errors identified in the project.

## ESLint Errors (44 problems)

These errors are mostly related to unused variables and imports. They should be relatively straightforward to fix.

**Priority:** High (as they clutter the lint output and can hide more serious issues)
**Complexity:** Low

### General Strategy:
- Review each unused variable/import.
- If truly unused, remove it.
- If it's a work-in-progress or temporarily unused, consider prefixing with `_` (e.g., `_unusedVar`) or adding an `eslint-disable-next-line @typescript-eslint/no-unused-vars` comment if necessary, but removal is preferred.

### Specific ESLint Issues:

**Unused Variables/Imports:**

- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/AvatarSelector.tsx:2:10 - 'TextComponent' is defined but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/BreadCrumbs.tsx:6:7 - 'capitalizeFirstLetter' is assigned a value but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/EditAssistantActionsDialog.tsx:4:10 - 'TextComponent' is defined but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/OnboardingStep1.tsx:10:10 - 'OnboardingStatus' is defined but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/OnboardingStep2.tsx:1:17 - 'useEffect' is defined but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/ShowOnboardingButton.tsx:4:10 - 'useNavigate' is defined but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/ShowOnboardingButton.tsx:5:10 - 'useRootStore' is defined but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/ShowOnboardingButton.tsx:6:19 - 'HelpCircle' is defined but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/ShowOnboardingButton.tsx:6:31 - 'LogOutIcon' is defined but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/TagInput.tsx:13:9 - 'isHebrew' is assigned a value but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/TagInput.tsx:4:10 - 'useRootStore' is defined but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/admin/LogItem.tsx:1:17 - 'useEffect' is defined but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/admin/LogItem.tsx:1:28 - 'useState' is defined but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/chat/AudioCircle.tsx:1:28 - 'useRef' is defined but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/chat/ChatFooterText.tsx:1:28 - 'MicrophoneIcon' is defined but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/chat/ChatFooterText.tsx:13:5 - 'isRecording' is assigned a value but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/chat/ChatFooterText.tsx:15:5 - 'startSpeechToText' is assigned a value but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/chat/ChatFooterVoice.tsx:5:3 - 'UserIcon' is defined but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/chat/ChatFooterVoice.tsx:7:3 - 'CloudArrowDownIcon' is defined but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/chat/ChatFooterVoice.tsx:8:3 - 'MinusIcon' is defined but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/chat/ChatFooterVoice.tsx:10:28 - 'useRef' is defined but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/chat/ChatFooterVoice.tsx:11:8 - 'useSpeechToText' is defined but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/chat/ChatFooterVoice.tsx:27:5 - 'interimTranscript' is assigned a value but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/chat/ChatFooterVoice.tsx:32:5 - 'isMicrophoneAvailable' is assigned a value but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/chat/ChatFooterVoice.tsx:5:3 - 'UserIcon' is defined but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/chat/ChatFooterVoice.tsx:7:3 - 'CloudArrowDownIcon' is defined but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/chat/ChatFooterVoice.tsx:8:3 - 'MinusIcon' is defined but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/chat/ChatFooterVoice.tsx:10:28 - 'useRef' is defined but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/chat/ChatFooterVoice.tsx:11:8 - 'useSpeechToText' is defined but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/chat/ChatFooterVoice.tsx:27:5 - 'interimTranscript' is assigned a value but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/chat/ChatFooterVoice.tsx:32:5 - 'isMicrophoneAvailable' is assigned a value but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/chat/ChatFooterVoice.tsx:36:11 - 'timerRunning' is assigned a value but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/chat/ChatFooterVoice.tsx:116:31 - \`'\` can be escaped with \`'\`, \`&lsquo;\`, \`&#39;\`, \`&rsquo;\` (react/no-unescaped-entities)`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/pages/admin/ChatBotEditingViews/EditChatbotState.tsx:4:10 - 'TextareaWithLabel' is defined but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/pages/admin/CompaniesPage.tsx:12:3 - 'EVENT_SHOW_ADD_COMPANY_MODAL' is defined but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/pages/admin/CompaniesPage.tsx:26:25 - 'row' is defined but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/pages/admin/CompaniesPage.tsx:30:35 - 'row' is defined but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/pages/admin/Onboarding.tsx:5:10 - 'OnboardingStatus' is defined but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/pages/admin/Onboarding.tsx:20:71 - 'isOpen' is defined but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/pages/admin/Onboarding.tsx:21:11 - 't' is assigned a value but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/pages/admin/UsersPage.tsx:13:3 - 'EVENT_SHOW_ADD_USER_MODAL' is defined but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/pages/admin/UsersPage.tsx:29:32 - 'row' is defined but never used`
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/pages/admin/inbox/InboxPage.tsx:3:10 - 'emitter' is defined but never used` (Already fixed - no lint errors in current code)
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/pages/admin/inbox/InboxPage.tsx:4:10 - 'EVENT_SHOW_ADD_USER_MODAL' is defined but never used` (Already fixed - no lint errors in current code)
- [x] `/Users/avi/dev/avio/sb/sb-chat-ui/src/pages/admin/inbox/InboxPage.tsx:44:13 - 'response' is assigned a value but never used` (Already fixed - no lint errors in current code)
- [ ] `/Users/avi/dev/avio/sb/sb-chat-ui/src/services/apiKeyVerificationService.ts:2:8 - 'axios' is defined but never used`
- [ ] `/Users/avi/dev/avio/sb/sb-chat-ui/src/store/chatStore.ts:10:10 - 'TTSVoice' is defined but never used` (Note: This might be related to a build error, investigate further)
- [ ] `/Users/avi/dev/avio/sb/sb-chat-ui/src/store/models/AuthStore.ts:4:3 - 'getToken' is defined but never used`

**Other ESLint Issues:**

- [ ] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/chat/ChatFooterContainer.tsx:6:3 - 'children' is missing in props validation (react/prop-types)`
    - **Fix:** Add `children` to prop-types validation or convert component to use TypeScript types for props.
- [ ] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/chat/ChatFooterContainer.tsx:8:10 - 'React' must be in scope when using JSX (react/react-in-jsx-scope)`
    - **Fix:** Add `import React from 'react';` if not present, or configure ESLint for new JSX transform.
- [ ] `/Users/avi/dev/avio/sb/sb-chat-ui/src/components/chat/ChatFooterVoice.tsx:116:31 - \`'\` can be escaped with \`'\`, \`&lsquo;\`, \`&#39;\`, \`&rsquo;\` (react/no-unescaped-entities)`
    - **Fix:** Replace the unescaped apostrophe with its HTML entity equivalent.
- [ ] `/Users/avi/dev/avio/sb/sb-chat-ui/src/store/models/AuthStore.ts:35:27 - This generator function does not have 'yield' (require-yield)`
    - **Fix:** If it's meant to be a generator, add `yield`. If not, make it a regular async function.
- [ ] `/Users/avi/dev/avio/sb/sb-chat-ui/src/store/models/AuthStore.ts:44:32 - 'decryptedApiKey' is assigned a value but never used`
    - **Fix:** Remove or use the variable.

## TypeScript Build Errors ✅ FIXED

**Status:** All TypeScript build errors have been successfully resolved!

**Fixes Applied:**

1. **`src/store/useAssistantStore.ts`** - ✅ Fixed type mismatches by using MST model types (`IAssistant`) instead of custom interface definitions. Updated API calls to handle proper type conversions.

2. **`src/store/useCompanyStore.ts`** - ✅ Fixed type mismatches by using MST model types (`ICompany`, `ApiKey`, `Token`, `Identifier`) and properly handling MST array types vs plain arrays.

3. **`src/store/useTeamStore.ts`** - ✅ Fixed type mismatches by using MST model type (`ITeam`) and proper type conversions for API calls.

4. **`src/store/useUserStore.ts`** - ✅ Fixed type mismatches by using MST model type (`IUser`) and `Identifier` from MST models.

**Key Changes Made:**
- Replaced custom interface definitions with MST model types to ensure consistency
- Added proper type assertions for API service calls
- Fixed MST array handling vs plain array incompatibilities  
- All stores now use consistent typing with the MST model layer

**Build Status:** ✅ `npm run build` now passes successfully with no TypeScript errors

## Next Steps - Remaining ESLint Issues

The remaining work focuses on cleaning up lint warnings:

1. **Remove unused imports and variables** - Low priority, mostly cleanup
2. **Fix prop validation issues** - Convert components to use TypeScript types
3. **Fix generator function issues** - Review AuthStore implementation
4. **Fix unescaped entity warnings** - Replace apostrophes with HTML entities

## Verification Steps
1. ✅ Run `npm run build` to check TypeScript errors - PASSING
2. [ ] Run `npm run lint` after fixing remaining lint issues  
3. ✅ Document architectural decisions (MST → Zustand type alignment)
4. [ ] Test affected components after changes
