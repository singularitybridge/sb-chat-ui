import React, { useCallback, useEffect, useState } from 'react';
import { Header } from './components/Header';
import { SideMenu } from './components/SideMenu';
import { Outlet } from 'react-router-dom';
import { RootStore } from './store/models/RootStore';
import { RootStoreProvider } from './store/common/RootStoreContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEventEmitter } from './services/mittEmitter';
import { EVENT_ASSISTANT_CREATED, EVENT_ASSISTANT_DELETED, EVENT_ASSISTANT_UPDATED, EVENT_ERROR } from './utils/eventNames';
import { DialogManager } from './components/admin/DialogManager';

const rootStore = RootStore.create({
  chatbots: [],
  userProfile: {
    _id: '1',
    name: 'Avi',
    avatar: '/images/avatars/av3.png',
    activeChatBot: 'remove me',
    isAudioPlaying: false,
  },
});

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [screenHeight, setScreenHeight] = useState(0);

  const toastHandler = useCallback((message: string) => {
    toast(message);
  }, []);

  useEventEmitter<string>(EVENT_ASSISTANT_UPDATED, toastHandler);
  useEventEmitter<string>(EVENT_ASSISTANT_DELETED, toastHandler);
  useEventEmitter<string>(EVENT_ASSISTANT_CREATED, toastHandler);
  useEventEmitter<string>(EVENT_ERROR, toastHandler);

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
    rootStore.loadAssistants();

    // rootStore.loadChatbots();
    // rootStore.loadChatSessions('');
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
        <Outlet />
      </div>
    </RootStoreProvider>
  );
};

export default App;
