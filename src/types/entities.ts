/**
 * Standalone TypeScript interfaces for all entities.
 * These replace the MobX State Tree model types.
 */

// ============================================
// Shared Types
// ============================================

export interface IIdentifier {
  _id?: string;
  key: string;
  value: string;
}

export interface IApiKey {
  key: string;
  value: string;
}

export interface IToken {
  value: string;
  iv: string;
  tag: string;
}

// ============================================
// Assistant
// ============================================

export interface IAssistant {
  _id: string;
  name: string;
  description: string;
  companyId: string;
  voice: string;
  language: string;
  llmModel: string;
  llmProvider: string;
  llmPrompt: string;
  maxTokens: number;
  avatarImage: string;
  allowedActions: string[];
  conversationStarters: IIdentifier[];
  teams: string[];
}

export type AssistantKeys = keyof IAssistant;

// ============================================
// Company
// ============================================

export interface ICompany {
  _id: string;
  name: string;
  description: string;
  token: IToken;
  api_keys: IApiKey[];
  identifiers: IIdentifier[];
  __v: number;
}

export type CompanyKeys = keyof ICompany;

// ============================================
// User
// ============================================

export interface IUser {
  _id: string;
  name: string;
  nickname?: string;
  email: string;
  googleId: string;
  role: string;
  companyId: string;
  identifiers: IIdentifier[];
}

export type UserKeys = keyof IUser;

// ============================================
// System User (for auth context)
// ============================================

export interface ISystemUser {
  _id: string;
  googleId: string;
  name: string;
  email: string;
  companyId: string;
  isAuthenticated: boolean;
}

// ============================================
// Team
// ============================================

export interface ITeam {
  _id: string;
  name: string;
  description: string;
  icon: string;
  companyId: string;
}

export type TeamKeys = keyof ITeam;

// ============================================
// Inbox / Messages
// ============================================

export type MessageType = 'human_agent_request' | 'human_agent_response' | 'notification';

export interface IMessage {
  _id: string;
  message: string;
  createdAt: string | null;
  sessionActive: boolean;
  assistantName: string | null;
  senderId: string | null;
  type: MessageType;
}

export interface IInboxSession {
  sessionId: string;
  messages: IMessage[];
  userName: string;
  lastMessageAt: string | null;
}

// ============================================
// Journal Entry
// ============================================

export interface IJournalEntry {
  _id: string;
  userId: string;
  companyId: string;
  sessionId?: string;
  timestamp: string;
  entryType: string;
  content: string;
  metadata?: Record<string, any>;
  tags?: string[];
  isIndexed?: boolean;
  embeddingId?: string;
  embeddingModel?: string;
  createdAt: string;
  updatedAt: string;
  userName?: string;
  agentName?: string | null;
  friendlyTimestamp?: string;
}

// ============================================
// AI Assisted Config
// ============================================

export interface AIAssistedFieldConfig {
  fieldKey: string;
  systemPrompt: string;
}

export interface AIAssistedFormConfig {
  formContext: string;
  fields: AIAssistedFieldConfig[];
}

// ============================================
// Onboarding
// ============================================

export enum OnboardingStatus {
  CREATED = 'created',
  API_KEY_REQUIRED = 'api_key_required',
  READY_FOR_ASSISTANTS = 'ready_for_assistants',
  USING_BASIC_FEATURES = 'using_basic_features',
  ADVANCED_USER = 'advanced_user',
  EXPERT_USER = 'expert_user'
}

// ============================================
// Session (for reference)
// ============================================

export interface ISession {
  _id: string;
  assistantId: string;
  language: string;
}

// ============================================
// Conversation Starter (alias for forms)
// ============================================

export interface ConversationStarter {
  _id?: string;
  key: string;
  value: string;
}
