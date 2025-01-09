export interface AssistantData {
  _id: string;
  // Add other properties as needed
}

export interface ActionNotification {
  type: 'action_start' | 'action_end' | 'action_error';
  actionName: string;
  timestamp: string;
  success?: boolean;
  error?: string;
}

export interface ChatMessage {
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface PusherEvent {
  message: AssistantData | ActionNotification | ChatMessage;
}

export type EventHandler<T> = (data: T) => void;

export type PusherEventMap = {
  createNewAssistant: EventHandler<PusherEvent>;
  setAssistant: EventHandler<PusherEvent>;
  actionNotification: EventHandler<PusherEvent>;
  actionExecution: EventHandler<PusherEvent>;
  chat_message: EventHandler<ChatMessage>;
};
