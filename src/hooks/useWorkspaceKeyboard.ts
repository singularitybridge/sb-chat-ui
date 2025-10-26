import { useEffect } from 'react';

export function useWorkspaceKeyboard(
  toggleChatPanel: () => void,
  toggleFileListPanel: () => void
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Debug log
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key.toLowerCase() === 'c' || e.key.toLowerCase() === 'e')) {
        console.log('Workspace keyboard shortcut detected:', {
          key: e.key,
          ctrlKey: e.ctrlKey,
          metaKey: e.metaKey,
          shiftKey: e.shiftKey,
        });
      }

      // Cmd+Shift+C (or Ctrl+Shift+C) - Toggle chat panel
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        console.log('Toggling chat panel');
        toggleChatPanel();
      }

      // Cmd+Shift+E (or Ctrl+Shift+E) - Toggle file list panel
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        console.log('Toggling file list panel');
        toggleFileListPanel();
      }
    };

    console.log('Workspace keyboard hook initialized');
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      console.log('Workspace keyboard hook cleanup');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleChatPanel, toggleFileListPanel]);
}
