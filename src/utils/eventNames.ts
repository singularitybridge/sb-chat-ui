export const EVENT_ASSISTANT_UPDATED = 'assistant-updated';
export const EVENT_ASSISTANT_DELETED = 'assistant-deleted';
export const EVENT_ASSISTANT_CREATED = 'assistant-created';

export const EVENT_SHOW_ADD_ASSISTANT_MODAL = 'show-add-assistant-modal';
export const EVENT_CLOSE_MODAL = 'close-modal';

export type EventType =
  | typeof EVENT_ASSISTANT_UPDATED
  | typeof EVENT_SHOW_ADD_ASSISTANT_MODAL
  | typeof EVENT_ASSISTANT_DELETED
  | typeof EVENT_ASSISTANT_CREATED
  | typeof EVENT_CLOSE_MODAL;
