import { ReactNode, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRootStore } from '../store/common/RootStoreContext';
import { observer } from 'mobx-react-lite';
import { autorun } from 'mobx';

interface ChatRouteLoaderProps {
  children: ReactNode;
}

export const ChatRouteLoader: React.FC<ChatRouteLoaderProps> = observer(
  ({ children }) => {
    const [loading, setLoading] = useState<boolean>(true);
    const { sessionId } = useParams<{ sessionId: string }>();
    const rootStore = useRootStore();

    useEffect(() => {
      autorun(() => {
        if (
          !rootStore.chatSessionsLoaded ||
          !rootStore.chatbotsLoaded ||
          !sessionId
        )
          return;

        rootStore.setActiveChatSession(sessionId);
        rootStore.setActiveChatbot(
          rootStore.selectedChatSession?.chatbot_key || '',
        );

        setLoading(false);
      });
    }, [
      rootStore.chatSessionsLoaded,
      rootStore.chatbotsLoaded,
      sessionId,
      rootStore.selectedChatSession,
    ]);

    if (loading) return <> loading ... </>;
    return <>{children}</>;
  },
);
