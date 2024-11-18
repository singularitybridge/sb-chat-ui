import React, { useCallback, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEventEmitter } from './services/mittEmitter';
import { DialogManager } from './components/admin/DialogManager';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { observer } from 'mobx-react-lite';
import AuthManager from './components/AuthManager';
import PusherManager from './components/PusherManager';
import {
  EVENT_CHAT_SESSION_DELETED,
  EVENT_ERROR,
  EVENT_SHOW_NOTIFICATION,
} from './utils/eventNames';
import { getInitialLanguage } from './i18n';

const initialLanguage = getInitialLanguage();

const App: React.FC = observer(() => {
  const direction = initialLanguage === 'he' ? 'rtl' : 'ltr';

  const toastHandler = useCallback((message: string) => {
    toast(message);
  }, []);

  useEventEmitter<string>(EVENT_CHAT_SESSION_DELETED, toastHandler);
  useEventEmitter<string>(EVENT_ERROR, toastHandler);
  useEventEmitter<string>(EVENT_SHOW_NOTIFICATION, toastHandler);

  useEffect(() => {
    document.documentElement.lang = initialLanguage;
    document.documentElement.dir = direction;
  }, [direction]);

  return (
    <GoogleOAuthProvider clientId="836003625529-l01g4b1iuhc0s1i7o33ms9qelgmghcmh.apps.googleusercontent.com">
      <AuthManager>
        <PusherManager />
        <div className="flex flex-col inset-0 font-noto-sans-hebrew">
          <ToastContainer position="bottom-right" />
          <DialogManager />
          <Outlet />
        </div>
      </AuthManager>
    </GoogleOAuthProvider>
  );
});

export default App;
