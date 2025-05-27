import apiClient from '../AxiosService';
import { IJournalEntry } from '../../store/models/JournalEntry';

interface GetJournalEntriesParams {
  userId?: string; // Made optional
  companyId?: string; // Made optional
  sessionId?: string;
  entryType?: string; // Changed from JournalEntryType
  tags?: string[] | string; // Can be array or comma-separated string
  limit?: number;
  scope?: 'user' | 'company';
}

interface SearchJournalEntriesParams {
  q: string;
  companyId?: string; // Made optional
  userId?: string;
  entryType?: string; // Changed from JournalEntryType
  tags?: string[] | string;
  limit?: number;
}

export async function getFriendlyJournalEntries(params: GetJournalEntriesParams): Promise<IJournalEntry[]> {
  try {
    // Convert tags array to comma-separated string if necessary
    const apiParams = { ...params };
    if (Array.isArray(apiParams.tags)) {
      apiParams.tags = apiParams.tags.join(',');
    }

    const requestPath = 'memory/entries/friendly';
    // console.log(`[memoryService] Sending GET request to: ${apiClient.defaults.baseURL}${requestPath}`, { params: apiParams }); // Debug log removed
    const response = await apiClient.get(requestPath, { params: apiParams });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch friendly journal entries:', error);
    throw error;
  }
}

export async function searchJournalEntries(params: SearchJournalEntriesParams): Promise<IJournalEntry[]> {
  try {
    // Convert tags array to comma-separated string if necessary
    const apiParams = { ...params };
    if (Array.isArray(apiParams.tags)) {
      apiParams.tags = apiParams.tags.join(',');
    }
    const requestPath = 'memory/entries/search';
    // console.log(`[memoryService] Sending GET request to: ${apiClient.defaults.baseURL}${requestPath}`, { params: apiParams }); // Debug log removed
    const response = await apiClient.get(requestPath, { params: apiParams });
    return response.data;
  } catch (error) {
    console.error('Failed to search journal entries:', error);
    throw error;
  }
}

export async function createJournalEntry(entryData: Partial<IJournalEntry>): Promise<IJournalEntry> {
  try {
    const response = await apiClient.post('memory/entries', entryData);
    return response.data;
  } catch (error) {
    console.error('Failed to create journal entry:', error);
    throw error;
  }
}

export async function updateJournalEntry(id: string, updates: Partial<IJournalEntry>): Promise<IJournalEntry> {
  try {
    const response = await apiClient.patch(`memory/entries/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error('Failed to update journal entry:', error);
    throw error;
  }
}

export async function deleteJournalEntry(id: string): Promise<void> {
  try {
    await apiClient.delete(`memory/entries/${id}`);
  } catch (error) {
    console.error('Failed to delete journal entry:', error);
    throw error;
  }
}
