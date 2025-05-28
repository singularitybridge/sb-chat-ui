import { ChatMessage } from '../types/chat';

interface MessageCache {
  [sessionId: string]: {
    messages: ChatMessage[];
    timestamp: number;
  };
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_ENTRIES = 10;

class MessageCacheManager {
  private cache: MessageCache = {};

  set(sessionId: string, messages: ChatMessage[]): void {
    // Clean up old entries if we're at the limit
    const keys = Object.keys(this.cache);
    if (keys.length >= MAX_CACHE_ENTRIES) {
      // Remove the oldest entry
      const oldestKey = keys.reduce((oldest, key) => {
        return this.cache[key].timestamp < this.cache[oldest].timestamp ? key : oldest;
      });
      delete this.cache[oldestKey];
    }

    this.cache[sessionId] = {
      messages,
      timestamp: Date.now(),
    };
  }

  get(sessionId: string): ChatMessage[] | null {
    const cached = this.cache[sessionId];
    
    if (!cached) {
      return null;
    }

    // Check if cache is expired
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      delete this.cache[sessionId];
      return null;
    }

    return cached.messages;
  }

  invalidate(sessionId: string): void {
    delete this.cache[sessionId];
  }

  clear(): void {
    this.cache = {};
  }
}

export const messageCache = new MessageCacheManager();