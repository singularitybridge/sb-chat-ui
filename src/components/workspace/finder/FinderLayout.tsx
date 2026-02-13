import React, { useEffect, useState, useCallback, useRef } from 'react';
import { listWorkspaceItems, getWorkspaceItem, vectorSearchWorkspace } from '../../../services/api/workspaceService';
import type { FinderFileItem } from './finder-types';
import { buildFileTree } from './finder-types';
import { useFinder } from './useFinder';
import { FinderSidebar } from './FinderSidebar';
import { FinderToolbar } from './FinderToolbar';
import { FinderFileList } from './FinderFileList';
import { FinderPreview } from './FinderPreview';
import { FinderFileModal } from './FinderFileModal';

interface FinderLayoutProps {
  agentId?: string;
  sessionId?: string;
  scope: 'company' | 'agent' | 'session';
  selectedFilePath: string | null;
  selectedFileContent: string | null;
  markdownViewMode: 'rendered' | 'raw';
  isReloadingFile: boolean;
  panels: { chatPanel: boolean; fileListPanel: boolean; previewPanel: boolean };
  onFileSelect: (path: string, content: string, type: string) => void;
  onDeleteFile: () => void;
  onReloadFile: () => void;
  onToggleMarkdownView: () => void;
  onShowEmbedDialog: () => void;
  onTogglePreviewPanel: () => void;
  injectWorkspaceAPIToHTML: (html: string) => string;
}

export const FinderLayout: React.FC<FinderLayoutProps> = ({
  agentId,
  sessionId,
  scope,
  selectedFilePath,
  selectedFileContent,
  markdownViewMode,
  isReloadingFile,
  panels,
  onFileSelect,
  onDeleteFile,
  onReloadFile,
  onToggleMarkdownView,
  onShowEmbedDialog,
  onTogglePreviewPanel,
  injectWorkspaceAPIToHTML,
}) => {
  const [tree, setTree] = useState<FinderFileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<FinderFileItem[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [modalFile, setModalFile] = useState<FinderFileItem | null>(null);
  const [modalContent, setModalContent] = useState<string | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finder = useFinder();

  // Load file tree
  const loadTree = useCallback(async () => {
    try {
      setLoading(true);
      const response = await listWorkspaceItems(scope, '', agentId, sessionId, undefined, true);

      if (response.success) {
        if (response.items && response.items.length > 0) {
          setTree(buildFileTree(response.items));
        } else if (response.paths) {
          setTree(buildFileTree(response.paths.map((p) => ({ path: p, metadata: {} }))));
        }
      }
    } catch (error) {
      console.error('FinderLayout: Failed to load files:', error);
    } finally {
      setLoading(false);
    }
  }, [scope, agentId, sessionId]);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  // Debounced AI vector search
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    const query = finder.searchQuery.trim();

    // Clear results when query is too short — fall back to client-side filter
    if (query.length < 3) {
      setSearchResults(null);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);

    searchDebounceRef.current = setTimeout(async () => {
      try {
        const results = await vectorSearchWorkspace(query, scope, agentId, sessionId, {
          limit: 20,
          minScore: 0.4,
        });

        // Convert vector search results to FinderFileItem[]
        const items: FinderFileItem[] = results.map((r) => {
          const parts = r.path.split('/').filter(Boolean);
          const name = parts[parts.length - 1] || r.path;
          const ext = name.includes('.') ? name.split('.').pop()?.toLowerCase() : undefined;
          return {
            name,
            path: r.path.startsWith('/') ? r.path : '/' + r.path,
            type: 'file' as const,
            extension: ext,
            size: r.metadata?.size,
            updatedAt: r.metadata?.updatedAt ? new Date(r.metadata.updatedAt) : undefined,
          };
        });

        setSearchResults(items);
      } catch (error) {
        console.error('FinderLayout: Vector search failed, falling back to filename filter:', error);
        setSearchResults(null);
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [finder.searchQuery, scope, agentId, sessionId]);

  // Sync selected file from parent (URL-driven)
  useEffect(() => {
    if (selectedFilePath && selectedFileContent) {
      // Find the file item in tree to set as selected
      const findItem = (items: FinderFileItem[]): FinderFileItem | null => {
        for (const item of items) {
          if (item.path === selectedFilePath) return item;
          if (item.children) {
            const found = findItem(item.children);
            if (found) return found;
          }
        }
        return null;
      };
      const item = findItem(tree);
      if (item) {
        finder.selectFile(item);
        finder.revealPath(item.path);
        setPreviewContent(selectedFileContent);
      }
    }
  }, [selectedFilePath, selectedFileContent, tree]);

  // Single-click selects file, loads preview, and updates URL
  const handleSelectFile = useCallback(
    async (file: FinderFileItem) => {
      finder.selectFile(file);
      finder.revealPath(file.path);

      // Trigger URL navigation
      const ext = file.extension || 'text';
      onFileSelect(file.path, '', ext);

      // If file is already loaded from URL, use that content
      if (file.path === selectedFilePath && selectedFileContent) {
        setPreviewContent(selectedFileContent);
        return;
      }

      // Load content for preview
      try {
        setPreviewLoading(true);
        const response = await getWorkspaceItem(file.path, scope, agentId, sessionId);
        if (response.found && response.content) {
          const content =
            typeof response.content === 'string'
              ? response.content
              : JSON.stringify(response.content, null, 2);
          setPreviewContent(content);
        }
      } catch (error) {
        console.error('FinderLayout: Failed to load preview:', error);
        setPreviewContent(null);
      } finally {
        setPreviewLoading(false);
      }
    },
    [scope, agentId, sessionId, selectedFilePath, selectedFileContent, finder, onFileSelect]
  );

  // Double-click opens file in a full-view modal
  const handleOpenFile = useCallback(
    async (file: FinderFileItem) => {
      finder.revealPath(file.path);

      // Use already-loaded preview content if it matches
      if (file.path === finder.selectedFile?.path && previewContent) {
        setModalFile(file);
        setModalContent(previewContent);
        return;
      }

      // Otherwise fetch the content
      try {
        const response = await getWorkspaceItem(file.path, scope, agentId, sessionId);
        if (response.found && response.content) {
          const content =
            typeof response.content === 'string'
              ? response.content
              : JSON.stringify(response.content, null, 2);
          setModalFile(file);
          setModalContent(content);
        }
      } catch (error) {
        console.error('FinderLayout: Failed to load file for modal:', error);
      }
    },
    [scope, agentId, sessionId, finder, previewContent]
  );

  // Refresh after file deletion
  const handleDelete = useCallback(() => {
    onDeleteFile();
    loadTree();
  }, [onDeleteFile, loadTree]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-zinc-400 mx-auto" />
          <p className="text-[13px] text-zinc-400">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden font-['IBM_Plex_Sans',sans-serif]">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:flex shrink-0">
        <FinderSidebar
          tree={tree}
          currentPath={finder.currentPath}
          expandedFolders={finder.expandedFolders}
          onNavigateFolder={finder.navigateToFolder}
          onToggleFolder={finder.toggleFolder}
        />
      </div>

      {/* Main area: toolbar + file list */}
      <div className="flex-1 flex flex-col min-w-0">
        <FinderToolbar
          currentPath={finder.currentPath}
          canGoBack={finder.canGoBack}
          canGoForward={finder.canGoForward}
          searchQuery={finder.searchQuery}
          showPreview={panels.previewPanel}
          isAISearch={searchResults !== null}
          isSearchLoading={searchLoading}
          onGoBack={finder.goBack}
          onGoForward={finder.goForward}
          onNavigateFolder={finder.navigateToFolder}
          onSearchChange={finder.setSearchQuery}
          onTogglePreview={onTogglePreviewPanel}
        />

        <FinderFileList
          tree={tree}
          currentPath={finder.currentPath}
          selectedFile={finder.selectedFile}
          searchQuery={finder.searchQuery}
          searchResults={searchResults}
          searchLoading={searchLoading}
          onSelectFile={handleSelectFile}
          onOpenFile={handleOpenFile}
          onNavigateFolder={finder.navigateToFolder}
        />
      </div>

      {/* Preview Panel - hidden on mobile and when toggled off */}
      {panels.previewPanel && (
        <div className="hidden md:flex w-80 shrink-0">
          <FinderPreview
            file={finder.selectedFile}
            fileContent={previewContent}
            isLoading={previewLoading || isReloadingFile}
            markdownViewMode={markdownViewMode}
            tree={tree}
            onWelcomeFileSelect={handleSelectFile}
            onReload={onReloadFile}
            onDelete={handleDelete}
            onEmbed={onShowEmbedDialog}
            onToggleMarkdownView={onToggleMarkdownView}
            injectWorkspaceAPIToHTML={injectWorkspaceAPIToHTML}
          />
        </div>
      )}

      {/* Full-view file modal (double-click) */}
      {modalFile && modalContent && (
        <FinderFileModal
          file={modalFile}
          content={modalContent}
          onClose={() => { setModalFile(null); setModalContent(null); }}
          injectWorkspaceAPIToHTML={injectWorkspaceAPIToHTML}
        />
      )}
    </div>
  );
};
