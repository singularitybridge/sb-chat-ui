// Assistant-related events
export const EVENT_SET_ACTIVE_ASSISTANT = 'set-active-assistant';
export const EVENT_SET_ASSISTANT_VALUES = 'set-assistant-values';
export const EVENT_SHOW_ADD_ASSISTANT_MODAL = 'show-add-assistant-modal';
export const EVENT_SHOW_EDIT_ASSISTANT_ACTIONS_MODAL = 'show-edit-assistant-actions-modal';

// Chat session events
export const EVENT_CHAT_SESSION_DELETED = 'chat-session-deleted';
export const EVENT_CHAT_MESSAGE = 'chat-message';

// Notification events
export const EVENT_SHOW_NOTIFICATION = 'show-notification';

// Modal events
export const EVENT_SHOW_ADD_COMPANY_MODAL = 'show-add-company-modal';
export const EVENT_SHOW_ADD_USER_MODAL = 'show-add-user-modal';
export const EVENT_SHOW_ADD_ACTION_MODAL = 'show-add-action-modal';
export const EVENT_SHOW_ADD_TEAM_MODAL = 'show-add-team-modal';
export const EVENT_SHOW_ONBOARDING_MODAL = 'show-onboarding-modal';
export const EVENT_SHOW_ADD_API_KEY_MODAL = 'show-add-api-key-modal';
export const EVENT_CLOSE_MODAL = 'close-modal';

// Error events
export const EVENT_ERROR = 'error';
export const EVENT_ACTION_EXECUTION = 'action_execution_update';

// Iframe events
export const EVENT_ADD_IFRAME_MESSAGE = 'add-iframe-message';

export type EventType =
  | typeof EVENT_SET_ACTIVE_ASSISTANT
  | typeof EVENT_SET_ASSISTANT_VALUES
  | typeof EVENT_SHOW_ADD_ASSISTANT_MODAL
  | typeof EVENT_SHOW_EDIT_ASSISTANT_ACTIONS_MODAL
  | typeof EVENT_CHAT_SESSION_DELETED
  | typeof EVENT_CHAT_MESSAGE
  | typeof EVENT_SHOW_NOTIFICATION
  | typeof EVENT_SHOW_ADD_COMPANY_MODAL
  | typeof EVENT_SHOW_ADD_USER_MODAL
  | typeof EVENT_SHOW_ADD_ACTION_MODAL
  | typeof EVENT_SHOW_ADD_TEAM_MODAL
  | typeof EVENT_SHOW_ONBOARDING_MODAL
  | typeof EVENT_SHOW_ADD_API_KEY_MODAL
  | typeof EVENT_CLOSE_MODAL
  | typeof EVENT_ERROR
  | typeof EVENT_ACTION_EXECUTION
  | typeof EVENT_ADD_IFRAME_MESSAGE;
