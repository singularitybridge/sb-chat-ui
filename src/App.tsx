import React, { useCallback, useEffect } from 'react';
import { Outlet } from 'react-router';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEventEmitter } from './services/mittEmitter';
import { DialogManager } from './components/admin/DialogManager';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AuthManager from './components/AuthManager';
import PusherManager from './components/PusherManager';
import { UiContextTracker } from './components/UiContextTracker';
import { CommandPaletteProvider } from './contexts/CommandPaletteContext';
import { GlobalCommandPalette } from './components/GlobalCommandPalette';
import {
  EVENT_CHAT_SESSION_DELETED,
  EVENT_ERROR,
  EVENT_SHOW_NOTIFICATION,
} from './utils/eventNames';
import { getInitialLanguage } from './i18n';
import { useWebSocketCommands } from './hooks/useWebSocketCommands';

const initialLanguage = getInitialLanguage();

const App: React.FC = () => {
  const direction = initialLanguage === 'he' ? 'rtl' : 'ltr';

  const toastHandler = useCallback((message: string) => {
    toast(message);
  }, []);

  useEventEmitter<string>(EVENT_CHAT_SESSION_DELETED, toastHandler);
  useEventEmitter<string>(EVENT_ERROR, toastHandler);
  useEventEmitter<string>(EVENT_SHOW_NOTIFICATION, toastHandler);

  // Initialize WebSocket command handlers (Phase 2)
  useWebSocketCommands();

  useEffect(() => {
    document.documentElement.lang = initialLanguage;
    document.documentElement.dir = direction;
  }, [direction]);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
      <AuthManager>
        <CommandPaletteProvider>
          <PusherManager />
          <UiContextTracker />
          <div className="h-screen flex flex-col font-noto-sans-hebrew">
            <ToastContainer position="bottom-right" />
            <DialogManager />
            <GlobalCommandPalette />
            <div className="flex-1 min-h-0">
              <Outlet />
            </div>
          </div>
        </CommandPaletteProvider>
      </AuthManager>
    </GoogleOAuthProvider>
  );
};

export default App;
