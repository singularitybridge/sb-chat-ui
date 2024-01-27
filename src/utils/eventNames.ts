export const EVENT_SET_ACTIVE_ASSISTANT = 'set-active-assistant';
export const EVENT_CHAT_SESSION_DELETED = 'chat-session-deleted';
export const EVENT_SHOW_NOTIFICATION = 'show-notification';
export const EVENT_SHOW_ADD_ASSISTANT_MODAL = 'show-add-assistant-modal';
export const EVENT_SHOW_ADD_COMPANY_MODAL = 'show-add-company-modal';
export const EVENT_SHOW_ADD_USER_MODAL = 'show-add-user-modal';
export const EVENT_SHOW_ADD_ACTION_MODAL = 'show-add-action-modal';
export const EVENT_CLOSE_MODAL = 'close-modal';
export const EVENT_ERROR = 'error';
export const EVENT_SET_ASSISTANT_VALUES = 'set-assistant-values';

export type EventType =
  | typeof EVENT_SHOW_ADD_ASSISTANT_MODAL
  | typeof EVENT_CLOSE_MODAL
  | typeof EVENT_ERROR
  | typeof EVENT_SET_ACTIVE_ASSISTANT
  | typeof EVENT_CHAT_SESSION_DELETED
  | typeof EVENT_SET_ASSISTANT_VALUES
  | typeof EVENT_SHOW_ADD_COMPANY_MODAL
  | typeof EVENT_SHOW_ADD_USER_MODAL
  | typeof EVENT_SHOW_NOTIFICATION
  | typeof EVENT_SHOW_ADD_ACTION_MODAL

