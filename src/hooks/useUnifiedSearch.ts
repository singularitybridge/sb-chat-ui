import { useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import { IAssistant, ITeam } from '../types/entities';
import { WorkspaceSearchItem } from '../contexts/CommandPaletteContext';

export type SearchResultType = 'assistant' | 'team' | 'workspace';

export interface UnifiedSearchResult {
  id: string;
  type: SearchResultType;
  data: IAssistant | ITeam | WorkspaceSearchItem;
  score?: number;
}

interface UseUnifiedSearchOptions {
  assistants: IAssistant[];
  teams: ITeam[];
  workspaceItems: WorkspaceSearchItem[];
}

export const useUnifiedSearch = (options: UseUnifiedSearchOptions) => {
  const { assistants, teams, workspaceItems } = options;
  const [searchQuery, setSearchQuery] = useState('');

  // Create Fuse instances for each entity type
  const assistantFuse = useMemo(
    () =>
      new Fuse(assistants, {
        keys: [
          { name: 'name', weight: 0.7 },
          { name: 'description', weight: 0.2 },
          { name: 'llmModel', weight: 0.1 },
        ],
        threshold: 0.3,
        includeScore: true,
        ignoreLocation: true,
      }),
    [assistants]
  );

  const teamFuse = useMemo(
    () =>
      new Fuse(teams, {
        keys: [
          { name: 'name', weight: 0.8 },
          { name: 'description', weight: 0.2 },
        ],
        threshold: 0.3,
        includeScore: true,
        ignoreLocation: true,
      }),
    [teams]
  );

  const workspaceFuse = useMemo(
    () =>
      new Fuse(workspaceItems, {
        keys: [
          { name: 'path', weight: 0.4 },
          { name: 'metadata.title', weight: 0.4 },
          { name: 'metadata.description', weight: 0.1 },
          { name: 'agentName', weight: 0.1 },
        ],
        threshold: 0.4,
        includeScore: true,
        ignoreLocation: true,
      }),
    [workspaceItems]
  );

  // Perform unified search
  const results = useMemo(() => {
    if (!searchQuery.trim()) {
      // Return all items when no search query
      const allResults: UnifiedSearchResult[] = [
        ...assistants.map((a) => ({
          id: a._id,
          type: 'assistant' as SearchResultType,
          data: a,
        })),
        ...teams.map((t) => ({
          id: t._id,
          type: 'team' as SearchResultType,
          data: t,
        })),
        ...workspaceItems.map((w, idx) => ({
          id: `workspace-${w.agentId}-${idx}`,
          type: 'workspace' as SearchResultType,
          data: w,
        })),
      ];
      return allResults;
    }

    // Search across all entity types
    const assistantResults = assistantFuse.search(searchQuery).map((result) => ({
      id: result.item._id,
      type: 'assistant' as SearchResultType,
      data: result.item,
      score: result.score,
    }));

    const teamResults = teamFuse.search(searchQuery).map((result) => ({
      id: result.item._id,
      type: 'team' as SearchResultType,
      data: result.item,
      score: result.score,
    }));

    const workspaceResults = workspaceFuse.search(searchQuery).map((result, idx) => ({
      id: `workspace-${result.item.agentId}-${idx}`,
      type: 'workspace' as SearchResultType,
      data: result.item,
      score: result.score,
    }));

    // Combine and sort by score
    const combined = [...assistantResults, ...teamResults, ...workspaceResults];
    combined.sort((a, b) => (a.score || 0) - (b.score || 0));

    return combined;
  }, [searchQuery, assistantFuse, teamFuse, workspaceFuse, assistants, teams, workspaceItems]);

  // Group results by type
  const groupedResults = useMemo(() => {
    return {
      assistants: results.filter((r) => r.type === 'assistant'),
      teams: results.filter((r) => r.type === 'team'),
      workspace: results.filter((r) => r.type === 'workspace'),
    };
  }, [results]);

  return {
    results,
    groupedResults,
    searchQuery,
    setSearchQuery,
  };
};
