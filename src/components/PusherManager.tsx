import React, { useEffect, useCallback } from 'react';
// import { observer } from 'mobx-react-lite'; // Removed if rootStore is no longer used
import { subscribeToSessionChannel, unsubscribeFromChannel } from '../services/PusherService';
// import { useRootStore } from '../store/common/RootStoreContext'; // Removed
import { useSessionStore } from '../store/useSessionStore'; // Import Zustand session store

const CHANNEL_PREFIX = 'sb-';

function PusherManager(): React.ReactElement | null { // Changed to function declaration
  // const rootStore = useRootStore(); // Removed
  const activeSessionId = useSessionStore(state => state.activeSession?._id); // Get activeSessionId from Zustand

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
}

export default PusherManager;
