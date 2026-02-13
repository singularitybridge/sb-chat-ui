import { useState, useEffect } from 'react';

interface PanelState {
  chatPanel: boolean;
  fileListPanel: boolean;
  previewPanel: boolean;
}

const STORAGE_KEY = 'workspace-panel-state';

export function useWorkspaceLayout() {
  const [panels, setPanels] = useState<PanelState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          chatPanel: parsed.chatPanel ?? true,
          fileListPanel: parsed.fileListPanel ?? true,
          previewPanel: parsed.previewPanel ?? true,
        };
      }
      return {
        chatPanel: true,
        fileListPanel: true,
        previewPanel: true
      };
    } catch (error) {
      console.error('Error reading workspace layout from localStorage:', error);
      return {
        chatPanel: true,
        fileListPanel: true,
        previewPanel: true
      };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(panels));
    } catch (error) {
      console.error('Error saving workspace layout to localStorage:', error);
    }
  }, [panels]);

  const togglePanel = (panel: keyof PanelState) => {
    setPanels(prev => ({
      ...prev,
      [panel]: !prev[panel]
    }));
  };

  return { panels, togglePanel };
}
