import React, { useCallback, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { RootStore } from './store/models/RootStore';
import { RootStoreProvider } from './store/common/RootStoreContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { emitter, useEventEmitter } from './services/mittEmitter';
import { DialogManager } from './components/admin/DialogManager';
import { ChatContainer } from './components/chat-container/ChatContainer';
import { pusher } from './services/PusherService';
import {
  LOCALSTORAGE_COMPANY_ID,
  LOCALSTORAGE_USER_ID,
  getLocalStorageItem,
  getSessionByCompanyAndUserId,
} from './services/api/sessionService';
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

const initialLanguage = localStorage.getItem('appLanguage') || 'en';

const rootStore = RootStore.create({
  assistants: [],
  users: [],
  language: initialLanguage,
});

const App: React.FC = observer(() => {
  
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const direction = initialLanguage === 'he' ? 'rtl' : 'ltr';

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

  const loadUserSession = async () => {
    try {
      if (
        getLocalStorageItem(LOCALSTORAGE_COMPANY_ID) &&
        getLocalStorageItem(LOCALSTORAGE_USER_ID)
      ) {
        rootStore.sessionStore.loadSessions();
        console.log('loading session');

        const session = await getSessionByCompanyAndUserId(
          getLocalStorageItem(LOCALSTORAGE_COMPANY_ID) as string,
          getLocalStorageItem(LOCALSTORAGE_USER_ID) as string
        );
        await rootStore.loadAssistants();
        rootStore.sessionStore.setActiveSession(session);        
        await rootStore.loadInboxMessages();
        await rootStore.loadActions();
      }
    } catch (error) {
      console.log('session not found');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await rootStore.loadUsers();
      await rootStore.loadCompanies();
      await loadUserSession();
      rootStore.checkAuthState();
      setIsDataLoaded(true);
    };
    loadData();
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

  if (!isDataLoaded) {
    return (
      <div style={styles.spinnerContainer}>
        <ClipLoader color="#123abc" loading={true} size={50} />
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId="836003625529-l01g4b1iuhc0s1i7o33ms9qelgmghcmh.apps.googleusercontent.com">
      <RootStoreProvider value={rootStore}>
        <div
          // style={style}
          dir={direction}
          className="flex flex-col h-screen inset-0 font-noto-sans-hebrew"
        >
          <ToastContainer />
          <DialogManager />
          {rootStore.isAuthenticated && <ChatContainer />}
          <Outlet />
        </div>
      </RootStoreProvider>
    </GoogleOAuthProvider>
  );
});

const styles = {
  spinnerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
};

export default App;
