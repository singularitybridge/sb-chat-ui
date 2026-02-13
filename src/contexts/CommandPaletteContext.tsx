import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAssistantStore } from '../store/useAssistantStore';
import { useTeamStore } from '../store/useTeamStore';
import { IAssistant, ITeam } from '../types/entities';
import { searchWorkspaceItemsMultiScope, vectorSearchWorkspace } from '../services/api/workspaceService';

export interface WorkspaceSearchItem {
  path: string;
  metadata?: {
    title?: string;
    description?: string;
    contentType?: string;
    [key: string]: any;
  };
  agentId?: string;
  agentName?: string;
}

interface CommandPaletteContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  assistants: IAssistant[];
  teams: ITeam[];
  workspaceItems: WorkspaceSearchItem[];
  refreshWorkspaceItems: () => Promise<void>;
  isLoadingWorkspace: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  vectorResults: WorkspaceSearchItem[] | null;
  isVectorSearching: boolean;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | undefined>(undefined);

export const CommandPaletteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { assistants } = useAssistantStore();
  const { teams } = useTeamStore();
  const [open, setOpen] = useState(false);
  const [workspaceItems, setWorkspaceItems] = useState<WorkspaceSearchItem[]>([]);
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [vectorResults, setVectorResults] = useState<WorkspaceSearchItem[] | null>(null);
  const [isVectorSearching, setIsVectorSearching] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refresh workspace items from all agents (OPTIMIZED - single batch request)
  const refreshWorkspaceItems = useCallback(async () => {
    setIsLoadingWorkspace(true);
    try {
      // Get all agent IDs
      const agentIds = assistants.map(a => a._id);

      if (agentIds.length === 0) {
        setWorkspaceItems([]);
        return;
      }

      // Single batch request for all agents with metadata
      const items = await searchWorkspaceItemsMultiScope({
        scopes: ['agent'],
        agentIds,
      });

      // Map results to include agent names
      const itemsWithAgentNames = items.map(item => {
        const assistant = assistants.find(a => a._id === item.scopeId);
        return {
          path: item.path,
          metadata: item.metadata,
          agentId: item.scopeId,
          agentName: assistant?.name || item.scopeName,
        };
      });

      setWorkspaceItems(itemsWithAgentNames);
    } catch (error) {
      console.error('Error refreshing workspace items:', error);
    } finally {
      setIsLoadingWorkspace(false);
    }
  }, [assistants]);

  // Refresh workspace items when command palette opens
  useEffect(() => {
    if (open && workspaceItems.length === 0) {
      refreshWorkspaceItems();
    }
  }, [open, workspaceItems.length, refreshWorkspaceItems]);

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Reset search query when palette closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setVectorResults(null);
      setIsVectorSearching(false);
    }
  }, [open]);

  // Debounced vector search for workspace items
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    const query = searchQuery.trim();

    if (query.length < 3) {
      setVectorResults(null);
      setIsVectorSearching(false);
      return;
    }

    setIsVectorSearching(true);

    searchDebounceRef.current = setTimeout(async () => {
      try {
        // Use the same vectorSearchWorkspace function as the workspace finder
        // Without a specific agentId, the backend defaults to searching all agents
        const results = await vectorSearchWorkspace(query, 'agent', undefined, undefined, {
          limit: 20,
          minScore: 0.4,
        });

        const items: WorkspaceSearchItem[] = results.map((r: any) => {
          const parts = r.path.split('/').filter(Boolean);
          const fileName = parts[parts.length - 1] || r.path;
          const matchedAssistant = assistants.find(a =>
            a._id === r.scopeId || a._id === r.metadata?.scopeId
          );
          return {
            path: r.path.startsWith('/') ? r.path : '/' + r.path,
            metadata: {
              title: r.metadata?.title || fileName,
              description: r.metadata?.description,
              contentType: r.metadata?.contentType,
            },
            agentId: matchedAssistant?._id || r.scopeId,
            agentName: matchedAssistant?.name,
          };
        });

        setVectorResults(items);
      } catch (error) {
        console.error('CommandPalette: Vector search failed, falling back to fuzzy search:', error);
        setVectorResults(null);
      } finally {
        setIsVectorSearching(false);
      }
    }, 400);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchQuery, assistants]);

  const value: CommandPaletteContextValue = {
    open,
    setOpen,
    assistants,
    teams,
    workspaceItems,
    refreshWorkspaceItems,
    isLoadingWorkspace,
    searchQuery,
    setSearchQuery,
    vectorResults,
    isVectorSearching,
  };

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
    </CommandPaletteContext.Provider>
  );
};

export const useCommandPalette = () => {
  const context = useContext(CommandPaletteContext);
  if (context === undefined) {
    throw new Error('useCommandPalette must be used within a CommandPaletteProvider');
  }
  return context;
};
