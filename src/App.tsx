/// file_path=src/App.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { RootStore } from './store/models/RootStore';
import { RootStoreProvider } from './store/common/RootStoreContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { emitter, useEventEmitter } from './services/mittEmitter';
import { DialogManager } from './components/admin/DialogManager';
import { pusher } from './services/PusherService';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { observer } from 'mobx-react-lite';
import { ClipLoader } from 'react-spinners';
import {
  EVENT_CHAT_SESSION_DELETED,
  EVENT_ERROR,
  EVENT_SHOW_NOTIFICATION,
  EVENT_SHOW_ADD_ASSISTANT_MODAL,
  EVENT_SET_ASSISTANT_VALUES,
  EVENT_SET_ACTIVE_ASSISTANT,
} from './utils/eventNames';
import { getInitialLanguage } from './i18n';

const initialLanguage = getInitialLanguage();

const rootStore = RootStore.create({
  authStore: {
    isAuthenticated: false,
  },
  assistants: [],
  users: [],
  language: initialLanguage,
});


const App: React.FC = observer(() => {
  
  const direction = initialLanguage === 'he' ? 'rtl' : 'ltr';
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      await rootStore.authStore.checkAuthStatus();
      if (rootStore.authStore.isAuthenticated && location.pathname === '/signup') {
        navigate('/admin');
      }
    };

    checkAuthAndNavigate();
  }, [navigate, location.pathname]);


  useEffect(() => {    
    document.documentElement.lang = rootStore.language;
    document.documentElement.dir = direction;
  }, [rootStore.language, direction]);


  const toastHandler = useCallback((message: string) => {
    toast(message);
  }, []);

  useEventEmitter<string>(EVENT_CHAT_SESSION_DELETED, toastHandler);
  useEventEmitter<string>(EVENT_ERROR, toastHandler);
  useEventEmitter<string>(EVENT_SHOW_NOTIFICATION, toastHandler);

  useEffect(() => {
    const channel = pusher.subscribe('sb');

    channel.bind('createNewAssistant', async function (data: any) {
      const newAssistantData = data.message; // contains name, description, prompt
      emitter.emit(EVENT_SHOW_ADD_ASSISTANT_MODAL, 'Add Assistant');
      await new Promise((resolve) => setTimeout(resolve, 100));
      emitter.emit(EVENT_SET_ASSISTANT_VALUES, newAssistantData);
    });

    channel.bind('setAssistant', async function (data: any) {
      const assistantData = data.message; // contains name, description, prompt
      emitter.emit(EVENT_SET_ACTIVE_ASSISTANT, assistantData._id);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe('sb');
    };
  }, []);


  useEffect(() => {
    const channel = pusher.subscribe('sb');
    channel.bind('createNewAssistant', async (data: any) => {
      const newAssistantData = data.message;
      emitter.emit(EVENT_SHOW_ADD_ASSISTANT_MODAL, 'Add Assistant');
      await new Promise((resolve) => setTimeout(resolve, 100));
      emitter.emit(EVENT_SET_ASSISTANT_VALUES, newAssistantData);
    });
    channel.bind('setAssistant', async (data: any) => {
      const assistantData = data.message;
      emitter.emit(EVENT_SET_ACTIVE_ASSISTANT, assistantData._id);
    });
    return () => {
      channel.unbind_all();
      pusher.unsubscribe('sb');
    };
  }, []);
  
  return (
    <GoogleOAuthProvider clientId="836003625529-l01g4b1iuhc0s1i7o33ms9qelgmghcmh.apps.googleusercontent.com">
      <RootStoreProvider value={rootStore}>
        <div className="flex flex-col inset-0 font-noto-sans-hebrew">
          <ToastContainer />
          <DialogManager />
          <Outlet />
        </div>
      </RootStoreProvider>
    </GoogleOAuthProvider>
  );
});



export default App;
