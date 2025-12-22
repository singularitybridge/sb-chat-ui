import React, { useEffect, useCallback } from 'react';
import {
  subscribeToSessionChannel,
  unsubscribeFromChannel,
} from '../services/PusherService';
import { useSessionStore } from '../store/useSessionStore';

const CHANNEL_PREFIX = 'sb-';

function PusherManager(): React.ReactElement | null {
  const activeSession = useSessionStore((state) => state.activeSession);
  const activeSessionId = activeSession?._id;

  const getChannelName = useCallback(
    (sessionId: string) => `${CHANNEL_PREFIX}${sessionId}`,
    []
  );

  useEffect(() => {
    if (!activeSessionId) {
      console.log(
        '🔍 [PUSHER_MANAGER] No active session ID, not subscribing to pusher'
      );
      return;
    }

    const channelName = getChannelName(activeSessionId);
    const channel = subscribeToSessionChannel(activeSessionId);

    if (!channel) {
      console.error(
        `❌ [PUSHER_MANAGER] Failed to subscribe to channel: ${channelName}`
      );
      return;
    }

    return () => {
      unsubscribeFromChannel(channelName);
    };
  }, [activeSessionId, getChannelName]);

  return null;
}

export default PusherManager;
