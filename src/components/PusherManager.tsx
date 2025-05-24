import React, { useEffect, useCallback } from 'react';
// import { observer } from 'mobx-react-lite'; // Removed if rootStore is no longer used
import { subscribeToSessionChannel, unsubscribeFromChannel } from '../services/PusherService';
// import { useRootStore } from '../store/common/RootStoreContext'; // Removed
import { useSessionStore } from '../store/useSessionStore'; // Import Zustand session store

const CHANNEL_PREFIX = 'sb-';

function PusherManager(): React.ReactElement | null { // Changed to function declaration
  // const rootStore = useRootStore(); // Removed
  const activeSession = useSessionStore(state => state.activeSession);
  const activeSessionId = activeSession?._id;
  
  // Debug session state
  console.log('🔍 [PUSHER_MANAGER] Component render:', {
    activeSession,
    activeSessionId,
    hasSession: !!activeSession,
    timestamp: new Date().toISOString()
  });

  const getChannelName = useCallback(
    (sessionId: string) => `${CHANNEL_PREFIX}${sessionId}`,
    []
  );

  useEffect(() => {
    if (!activeSessionId) {
      console.log('🔍 [PUSHER_MANAGER] No active session ID, not subscribing to pusher');
      return;
    }

    const channelName = getChannelName(activeSessionId);
    console.log('🔄 [PUSHER_MANAGER] Session changed, subscribing to pusher:', {
      activeSessionId,
      channelName,
      timestamp: new Date().toISOString()
    });
    
    const channel = subscribeToSessionChannel(activeSessionId);

    if (!channel) {
      console.error(`❌ [PUSHER_MANAGER] Failed to subscribe to channel: ${channelName}`);
      return;
    }

    return () => {
      console.log('🔄 [PUSHER_MANAGER] Unsubscribing from pusher channel:', {
        channelName,
        timestamp: new Date().toISOString()
      });
      unsubscribeFromChannel(channelName);
    };
  }, [activeSessionId, getChannelName]);

  return null;
}

export default PusherManager;
