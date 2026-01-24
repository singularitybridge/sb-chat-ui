import axios from 'axios';
import { singleFlight } from '../../utils/singleFlight';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface WorkspaceItem {
  path: string;
  content: any;
  metadata?: {
    contentType?: string;
    size?: number;
    createdAt?: Date;
    updatedAt?: Date;
    ttl?: number;
    [key: string]: any;
  };
}

export interface WorkspaceListResponse {
  success: boolean;
  scope: string;
  prefix: string;
  paths?: string[]; // Optional for backwards compatibility
  items?: Array<{
    path: string;
    metadata: {
      contentType?: string;
      size?: number;
      createdAt?: Date | string;
      updatedAt?: Date | string;
      ttl?: number;
      [key: string]: any;
    };
    type?: 'embedded' | 'external';
    size?: number;
  }>;
  count: number;
}

export interface WorkspaceGetResponse {
  success: boolean;
  path: string;
  found: boolean;
  content?: any;
  file?: any;
  isFile?: boolean;
  isBinary?: boolean;
}

/**
 * List items in workspace at specific scope
 */
export const listWorkspaceItems = async (
  scope: 'company' | 'session' | 'agent' | 'team' = 'agent',
  prefix: string = '',
  agentId?: string,
  sessionId?: string,
  teamId?: string,
  withMetadata: boolean = false
): Promise<WorkspaceListResponse> => {
  const key = `workspace:list:${scope}:${prefix}:${agentId || ''}:${sessionId || ''}:${teamId || ''}:${withMetadata}`;

  return singleFlight(
    key,
    async () => {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${localStorage.getItem('userToken')}`,
      };

      if (sessionId) {
        headers['x-session-id'] = sessionId;
      }

      if (agentId) {
        headers['x-agent-id'] = agentId;
      }

      if (teamId) {
        headers['x-team-id'] = teamId;
      }

      const params = new URLSearchParams({
        scope,
        ...(prefix && { prefix }),
        ...(agentId && { agentId }),
        ...(teamId && { teamId }),
        ...(withMetadata && { withMetadata: 'true' }),
      });

      const response = await axios.get(
        `${API_URL}/api/workspace/list?${params.toString()}`,
        { headers }
      );

      return response.data;
    },
    30000 // 30 second cache
  );
};

/**
 * Get workspace item content
 */
export const getWorkspaceItem = async (
  path: string,
  scope: 'company' | 'session' | 'agent' | 'team' = 'agent',
  agentId?: string,
  sessionId?: string,
  teamId?: string
): Promise<WorkspaceGetResponse> => {
  const key = `workspace:get:${scope}:${path}:${agentId || ''}:${sessionId || ''}:${teamId || ''}`;

  return singleFlight(
    key,
    async () => {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${localStorage.getItem('userToken')}`,
      };

      if (sessionId) {
        headers['x-session-id'] = sessionId;
      }

      if (agentId) {
        headers['x-agent-id'] = agentId;
      }

      if (teamId) {
        headers['x-team-id'] = teamId;
      }

      const params = new URLSearchParams({
        path,
        scope,
        ...(agentId && { agentId }),
        ...(teamId && { teamId }),
      });

      const response = await axios.get(
        `${API_URL}/api/workspace/get?${params.toString()}`,
        { headers }
      );

      return response.data;
    },
    30000 // 30 second cache
  );
};

/**
 * Get raw file content (for HTML files)
 */
export const getWorkspaceRawContent = async (
  path: string,
  scope: 'company' | 'session' | 'agent' | 'team' = 'agent',
  agentId?: string,
  sessionId?: string,
  teamId?: string
): Promise<string> => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${localStorage.getItem('userToken')}`,
  };

  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }

  if (agentId) {
    headers['x-agent-id'] = agentId;
  }

  if (teamId) {
    headers['x-team-id'] = teamId;
  }

  const params = new URLSearchParams({
    path,
    scope,
    ...(agentId && { agentId }),
    ...(teamId && { teamId }),
  });

  const response = await axios.get(
    `${API_URL}/api/workspace/raw?${params.toString()}`,
    { headers, responseType: 'text' }
  );

  return response.data;
};

/**
 * Delete workspace item
 */
export const deleteWorkspaceItem = async (
  path: string,
  scope: 'company' | 'session' | 'agent' | 'team' = 'agent',
  agentId?: string,
  sessionId?: string,
  teamId?: string
): Promise<{ success: boolean; message?: string; error?: string }> => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${localStorage.getItem('userToken')}`,
  };

  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }

  if (agentId) {
    headers['x-agent-id'] = agentId;
  }

  if (teamId) {
    headers['x-team-id'] = teamId;
  }

  const response = await axios.delete(
    `${API_URL}/api/workspace/delete`,
    {
      headers,
      data: {
        path,
        scope,
        ...(agentId && { agentId }),
        ...(teamId && { teamId }),
      }
    }
  );

  return response.data;
};

/**
 * Search workspace items with metadata for global search
 * DEPRECATED: Use searchWorkspaceItemsMultiScope instead for better performance
 */
export const searchWorkspaceItems = async (
  scope: 'company' | 'session' | 'agent' | 'team' = 'agent',
  agentId?: string,
  sessionId?: string,
  teamId?: string
): Promise<Array<{ path: string; metadata?: any; agentId?: string; agentName?: string }>> => {
  try {
    const listResponse = await listWorkspaceItems(scope, '', agentId, sessionId, teamId);

    if (!listResponse.success || !listResponse.paths || listResponse.paths.length === 0) {
      return [];
    }

    // Get metadata for each item
    const itemsWithMetadata = await Promise.all(
      listResponse.paths.map(async (path) => {
        try {
          const item = await getWorkspaceItem(path, scope, agentId, sessionId, teamId);
          return {
            path,
            metadata: item.content?.metadata || {},
            agentId,
            agentName: undefined, // Will be populated by caller if needed
          };
        } catch (_error) {
          return {
            path,
            metadata: {},
            agentId,
          };
        }
      })
    );

    return itemsWithMetadata;
  } catch (error) {
    console.error('Error searching workspace items:', error);
    return [];
  }
};

/**
 * Search workspace items across multiple scopes with metadata (OPTIMIZED)
 * Uses the new batch endpoint to retrieve all items with metadata in a single request per scope
 */
export const searchWorkspaceItemsMultiScope = async (
  options: {
    scopes?: Array<'company' | 'session' | 'agent' | 'team'>;
    agentIds?: string[];
    teamIds?: string[];
    includeCompany?: boolean;
    includeSession?: boolean;
    prefix?: string;
  }
): Promise<Array<{
  path: string;
  metadata: any;
  scope: string;
  scopeId?: string;
  scopeName?: string;
}>> => {
  const key = `workspace:search:${JSON.stringify(options)}`;

  return singleFlight(
    key,
    async () => {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${localStorage.getItem('userToken')}`,
      };

      const params = new URLSearchParams();

      if (options.scopes && options.scopes.length > 0) {
        params.append('scopes', options.scopes.join(','));
      }

      if (options.agentIds && options.agentIds.length > 0) {
        params.append('agentIds', options.agentIds.join(','));
      }

      if (options.teamIds && options.teamIds.length > 0) {
        params.append('teamIds', options.teamIds.join(','));
      }

      if (options.includeCompany) {
        params.append('includeCompany', 'true');
      }

      if (options.includeSession) {
        params.append('includeSession', 'true');
      }

      if (options.prefix) {
        params.append('prefix', options.prefix);
      }

      const response = await axios.get(
        `${API_URL}/api/workspace/search?${params.toString()}`,
        { headers }
      );

      return response.data.items || [];
    },
    30000 // 30 second cache
  );
};

/**
 * Find default entry file in workspace
 * Supports: HTML, MDX, MD files
 * Looks for: README first (root), then index files (root), then other entry files
 */
export const findDefaultEntryFile = async (
  agentId?: string,
  sessionId?: string,
  scope: 'company' | 'session' | 'agent' | 'team' = 'agent'
): Promise<string | null> => {
  try {
    // List all files in workspace with the specified scope
    const listResponse = await listWorkspaceItems(scope, '', agentId, sessionId);

    if (!listResponse.success || listResponse.paths?.length === 0) {
      return null;
    }

    // Priority 1: Look for README at root level first
    const rootReadme = listResponse.paths?.find(p =>
      p === '/README.mdx' || p === '/README.md' || p === '/readme.mdx' || p === '/readme.md'
    );
    if (rootReadme) return rootReadme;

    // Priority 2: Look for index files at root level
    const rootIndex = listResponse.paths?.find(p =>
      p === '/index.html' || p === '/index.mdx' || p === '/index.md'
    );
    if (rootIndex) return rootIndex;

    // Priority 3: Look for common entry point names (in order of preference)
    // Prioritize: index files, then app files, then main files, then home files
    // Within each category: HTML > MDX > MD
    const preferredNames = [
      'index.html', 'index.mdx', 'index.md',
      'app.html', 'app.mdx', 'app.md',
      'main.html', 'main.mdx', 'main.md',
      'home.html', 'home.mdx', 'home.md'
    ];

    for (const preferredName of preferredNames) {
      const found = listResponse.paths?.find(p =>
        p.toLowerCase().endsWith('/' + preferredName)
      );
      if (found) {
        return found;
      }
    }

    // Priority 4: If no preferred name found, look for any file in priority order: HTML > MDX > MD
    const htmlFile = listResponse.paths?.find(p => p.toLowerCase().endsWith('.html'));
    if (htmlFile) return htmlFile;

    const mdxFile = listResponse.paths?.find(p => p.toLowerCase().endsWith('.mdx'));
    if (mdxFile) return mdxFile;

    const mdFile = listResponse.paths?.find(p => p.toLowerCase().endsWith('.md'));
    if (mdFile) return mdFile;

    return null;
  } catch (error) {
    console.error('Error finding default entry file:', error);
    return null;
  }
};
