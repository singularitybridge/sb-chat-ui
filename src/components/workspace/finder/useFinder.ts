import { useState, useCallback, useEffect } from 'react';
import type { FinderFileItem } from './finder-types';

interface FinderState {
  currentPath: string;
  selectedFile: FinderFileItem | null;
  history: string[];
  historyIndex: number;
  expandedFolders: Set<string>;
  searchQuery: string;
}

export function useFinder() {
  const [state, setState] = useState<FinderState>({
    currentPath: '/',
    selectedFile: null,
    history: ['/'],
    historyIndex: 0,
    expandedFolders: new Set<string>(),
    searchQuery: '',
  });

  const canGoBack = state.historyIndex > 0;
  const canGoForward = state.historyIndex < state.history.length - 1;

  const navigateToFolder = useCallback((folderPath: string) => {
    setState((prev) => {
      // Trim history forward from current position, then push new path
      const newHistory = [...prev.history.slice(0, prev.historyIndex + 1), folderPath];
      return {
        ...prev,
        currentPath: folderPath,
        selectedFile: null,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  const goBack = useCallback(() => {
    setState((prev) => {
      if (prev.historyIndex <= 0) return prev;
      const newIndex = prev.historyIndex - 1;
      return {
        ...prev,
        currentPath: prev.history[newIndex],
        selectedFile: null,
        historyIndex: newIndex,
      };
    });
  }, []);

  const goForward = useCallback(() => {
    setState((prev) => {
      if (prev.historyIndex >= prev.history.length - 1) return prev;
      const newIndex = prev.historyIndex + 1;
      return {
        ...prev,
        currentPath: prev.history[newIndex],
        selectedFile: null,
        historyIndex: newIndex,
      };
    });
  }, []);

  const goUp = useCallback(() => {
    setState((prev) => {
      if (prev.currentPath === '/') return prev;
      const parts = prev.currentPath.split('/').filter(Boolean);
      parts.pop();
      const parentPath = parts.length === 0 ? '/' : '/' + parts.join('/');
      const newHistory = [...prev.history.slice(0, prev.historyIndex + 1), parentPath];
      return {
        ...prev,
        currentPath: parentPath,
        selectedFile: null,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  const selectFile = useCallback((file: FinderFileItem | null) => {
    setState((prev) => ({ ...prev, selectedFile: file }));
  }, []);

  /** Expand all ancestor folders for a path and navigate to its parent directory */
  const revealPath = useCallback((filePath: string) => {
    setState((prev) => {
      const parts = filePath.split('/').filter(Boolean);
      // Build all ancestor folder paths
      const expanded = new Set(prev.expandedFolders);
      for (let i = 1; i <= parts.length - 1; i++) {
        expanded.add('/' + parts.slice(0, i).join('/'));
      }

      // Navigate currentPath to the file's parent folder
      const parentParts = parts.slice(0, -1);
      const parentPath = parentParts.length === 0 ? '/' : '/' + parentParts.join('/');

      // Only push to history if the path actually changed
      if (prev.currentPath === parentPath) {
        return { ...prev, expandedFolders: expanded };
      }

      const newHistory = [...prev.history.slice(0, prev.historyIndex + 1), parentPath];
      return {
        ...prev,
        currentPath: parentPath,
        expandedFolders: expanded,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  const toggleFolder = useCallback((folderPath: string) => {
    setState((prev) => {
      const next = new Set(prev.expandedFolders);
      if (next.has(folderPath)) {
        next.delete(folderPath);
      } else {
        next.add(folderPath);
      }
      return { ...prev, expandedFolders: next };
    });
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setState((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  // Keyboard handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      if (e.key === 'Backspace') {
        e.preventDefault();
        goUp();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goUp]);

  return {
    currentPath: state.currentPath,
    selectedFile: state.selectedFile,
    expandedFolders: state.expandedFolders,
    searchQuery: state.searchQuery,
    canGoBack,
    canGoForward,
    navigateToFolder,
    goBack,
    goForward,
    goUp,
    selectFile,
    revealPath,
    toggleFolder,
    setSearchQuery,
  };
}
