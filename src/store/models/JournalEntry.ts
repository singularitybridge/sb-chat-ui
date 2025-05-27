export interface IJournalEntry {
  _id: string;
  userId: string;
  companyId: string;
  sessionId?: string; // Optional as per API doc example
  timestamp: string; // ISO Date string
  entryType: string; // Changed from JournalEntryType enum to string
  content: string;
  metadata?: Record<string, any>; // Optional
  tags?: string[]; // Optional
  isIndexed?: boolean; // Optional, from API response
  embeddingId?: string; // Optional, from API response
  embeddingModel?: string; // Optional, from API response
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string

  // Fields from /entries/friendly endpoint
  userName?: string;
  agentName?: string | null;
  friendlyTimestamp?: string;
}
