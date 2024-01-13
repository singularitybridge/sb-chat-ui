import React, { useCallback, useEffect, useState } from 'react';
import { Header } from './components/Header';
import { SideMenu } from './components/SideMenu';
import { Outlet } from 'react-router-dom';
import { RootStore } from './store/models/RootStore';
import { RootStoreProvider } from './store/common/RootStoreContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { emitter, useEventEmitter } from './services/mittEmitter';
import {
  EVENT_CHAT_SESSION_DELETED,
  EVENT_ERROR,
  EVENT_SET_ACTIVE_ASSISTANT,
  EVENT_SET_ASSISTANT_VALUES,
  EVENT_SHOW_ADD_ASSISTANT_MODAL,
  EVENT_SHOW_NOTIFICATION,
} from './utils/eventNames';
import { DialogManager } from './components/admin/DialogManager';
import { ChatContainer } from './components/chat-container/ChatContainer';
import { pusher } from './services/PusherService';
import { autorun } from 'mobx';
import { LOCALSTORAGE_SESSION_ID, getLocalStorageItem } from './services/api/sessionService';

const rootStore = RootStore.create({
  assistants: [],
  sessions: [],
  users: [],
});

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [screenHeight, setScreenHeight] = useState(0);

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
      console.log(newAssistantData);
      emitter.emit(EVENT_SHOW_ADD_ASSISTANT_MODAL, 'Add Assistant');
      await new Promise((resolve) => setTimeout(resolve, 100));
      emitter.emit(EVENT_SET_ASSISTANT_VALUES, newAssistantData);
    });

    channel.bind('setAssistant', async function (data: any) {
      const assistantData = data.message; // contains name, description, prompt
      console.log(assistantData);
      emitter.emit(EVENT_SET_ACTIVE_ASSISTANT, assistantData._id);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe('sb');
    };
  }, []);

  const getHeight = useCallback(
    () =>
      window.visualViewport ? window.visualViewport.height : window.innerHeight,
    []
  );

  const handleClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (event.target !== event.currentTarget && isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  const handleResize = () => {
    setScreenHeight(getHeight());
  };

  useEffect(() => {
    setScreenHeight(getHeight());

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    window.visualViewport?.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      window.visualViewport?.removeEventListener('resize', handleResize);
    };
  }, [getHeight]);

  const style = { height: `${screenHeight}px` };

  useEffect(() => {
    
    rootStore.loadSessions();
    
    rootStore.loadCompanies();    
    rootStore.loadUsers();

    autorun(() => {
      const sessionsLoaded = rootStore.sessions.length > 0;
      if (sessionsLoaded) {
        const currentSessionId = getLocalStorageItem(LOCALSTORAGE_SESSION_ID);
        if (currentSessionId) {          
          rootStore.setActiveSession(currentSessionId);
          rootStore.loadAssistants();
        }
      }
    });
  }, [rootStore]);

  return (
    <RootStoreProvider value={rootStore}>
      <div
        style={style}
        className="flex flex-col h-screen inset-0"
        onClick={handleClick}
      >
        <Header onMenuClick={() => setIsMenuOpen(true)} />
        <SideMenu isOpen={isMenuOpen} closeMenu={() => setIsMenuOpen(false)} />
        <ToastContainer />
        <DialogManager />
        <ChatContainer />
        <Outlet />
      </div>
    </RootStoreProvider>
  );
};

export default App;
