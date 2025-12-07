import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRootStore } from '../store/common/RootStoreContext';
import { IAssistant } from '../store/models/Assistant';
import { ITeam } from '../store/models/Team';
import { searchWorkspaceItemsMultiScope } from '../services/api/workspaceService';

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
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | undefined>(undefined);

export const CommandPaletteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const rootStore = useRootStore();
  const [open, setOpen] = useState(false);
  const [workspaceItems, setWorkspaceItems] = useState<WorkspaceSearchItem[]>([]);
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(false);

  // Refresh workspace items from all agents (OPTIMIZED - single batch request)
  const refreshWorkspaceItems = useCallback(async () => {
    setIsLoadingWorkspace(true);
    try {
      // Get all agent IDs
      const agentIds = rootStore.assistants.map(a => a._id);

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
        const assistant = rootStore.assistants.find(a => a._id === item.scopeId);
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
  }, [rootStore.assistants]);

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

  const value: CommandPaletteContextValue = {
    open,
    setOpen,
    assistants: rootStore.assistants,
    teams: rootStore.teams,
    workspaceItems,
    refreshWorkspaceItems,
    isLoadingWorkspace,
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
