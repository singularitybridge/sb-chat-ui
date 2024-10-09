import React, { useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { subscribeToSessionChannel, unsubscribeFromChannel } from '../services/PusherService';
import { useRootStore } from '../store/common/RootStoreContext';

const CHANNEL_PREFIX = 'sb-';

const PusherManager: React.FC = observer(() => {
  const rootStore = useRootStore();
  const { activeSessionId } = rootStore.sessionStore;

  const getChannelName = useCallback(
    (sessionId: string) => `${CHANNEL_PREFIX}${sessionId}`,
    []
  );

  useEffect(() => {
    if (!activeSessionId) return;

    const channelName = getChannelName(activeSessionId);
    console.log(`Subscribing to Pusher channel: ${channelName}`);
    const channel = subscribeToSessionChannel(activeSessionId);

    if (!channel) {
      console.error(`Failed to subscribe to channel: ${channelName}`);
      return;
    }

    return () => {
      console.log(`Unsubscribing from Pusher channel: ${channelName}`);
      unsubscribeFromChannel(channelName);
    };
  }, [activeSessionId, getChannelName]);

  return null;
});

export default PusherManager;
