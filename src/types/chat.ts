// Chat message types
export interface Metadata {
  message_type: string;
  [key: string]: any;
}

export interface ApiResponseMessageContentItemText {
  value: string;
}

export interface ApiResponseMessageContentItem {
  type: 'text';
  text: ApiResponseMessageContentItemText;
}

export interface ApiResponseMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: ApiResponseMessageContentItem[];
  created_at: number;
  assistant_id?: string;
  thread_id?: string;
  message_type: string;
  data?: { [key: string]: any };
}

export interface FileMetadata {
  id?: string;
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  gcpStorageUrl?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: string;
  metadata?: Metadata;
  assistantName?: string;
  createdAt: number;
  isStreaming?: boolean;
  fileMetadata?: FileMetadata;
}

export interface AssistantInfo {
  _id: string;
  voice?: string;
  name?: string;
}

export type AudioState = 'disabled' | 'enabled' | 'playing';

export interface ActionExecutionMessage {
  messageId: string;
  actionId: string;
  serviceName: string;
  actionTitle: string;
  actionDescription: string;
  icon: string;
  originalActionId: string;
  status: 'started' | 'completed' | 'failed';
}
