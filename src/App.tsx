import React, { useCallback, useEffect } from 'react';
import { Outlet } from 'react-router';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEventEmitter } from './services/mittEmitter';
import { DialogManager } from './components/admin/DialogManager';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AuthManager from './components/AuthManager';
import SessionManager from './components/SessionManager';
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

  // Handle both string and object notification payloads
  type NotificationPayload = string | { message: string; type?: 'success' | 'error' | 'info' | 'warning' };

  const toastHandler = useCallback((payload: NotificationPayload) => {
    if (typeof payload === 'string') {
      toast(payload);
    } else if (payload && typeof payload === 'object' && 'message' in payload) {
      const { message, type = 'info' } = payload;
      switch (type) {
        case 'success':
          toast.success(message);
          break;
        case 'error':
          toast.error(message);
          break;
        case 'warning':
          toast.warning(message);
          break;
        default:
          toast.info(message);
      }
    }
  }, []);

  useEventEmitter<NotificationPayload>(EVENT_CHAT_SESSION_DELETED, toastHandler);
  useEventEmitter<NotificationPayload>(EVENT_ERROR, toastHandler);
  useEventEmitter<NotificationPayload>(EVENT_SHOW_NOTIFICATION, toastHandler);

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
          <SessionManager />
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
