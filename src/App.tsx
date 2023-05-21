import React, { SVGProps, useCallback, useEffect, useState } from "react";
import { Chat } from "./pages/Chat";
import { Header } from "./components/Header";
import { SideMenu } from "./components/SideMenu";
import { Outlet, useParams } from "react-router-dom";
import {
  contextData,
  chatBotsState,
  userProfileState,
} from "./atoms/dataStore";
import { useRecoilState } from "recoil";
import { fetchContextData, fetchChatBots } from "./services/BaseRowService";
import { Provider } from "mobx-react";
import { RootStore } from "./store/models/RootStore";
import { RootStoreProvider } from "./store/common/RootStoreContext";

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [screenHeight, setScreenHeight] = useState(0);
  const { id } = useParams<{ id: string }>();
  const [userProfile, setUserProfile] = useRecoilState(userProfileState);
  const [chatBots, setChatsBots] = useRecoilState(chatBotsState);
  const [context, setContext] = useRecoilState(contextData);

  useEffect(() => {
    if (!id) {
      return;
    }

    setUserProfile({
      ...userProfile,
      activeChatBot: id,
    });

    fetchChatBots().then((data) => {
      setChatsBots(data);
    });

    fetchContextData(id).then((data) => {
      setContext(data);
    });
  }, [id]);

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

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    window.visualViewport?.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      window.visualViewport?.removeEventListener("resize", handleResize);
    };
  }, [getHeight]);

  const style = { height: `${screenHeight}px` };

  const rootStore = RootStore.create({
    chatbots: []
  });

  useEffect(() => {
    rootStore.loadChatbots();
  }, []);


  return (
    <RootStoreProvider value={rootStore}>
      <div
        style={style}
        className="flex flex-col h-screen inset-0"
        onClick={handleClick}
      >
        <Header onMenuClick={() => setIsMenuOpen(true)} />
        <SideMenu isOpen={isMenuOpen} closeMenu={() => setIsMenuOpen(false)} />
        <Outlet />
      </div>
    </RootStoreProvider>
  );
};

export default App;
