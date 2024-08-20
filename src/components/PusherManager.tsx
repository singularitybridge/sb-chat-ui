import React, { useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { pusher } from '../services/PusherService';
import { emitter } from '../services/mittEmitter';
import {
  EVENT_SHOW_ADD_ASSISTANT_MODAL,
  EVENT_SET_ASSISTANT_VALUES,
  EVENT_SET_ACTIVE_ASSISTANT,
} from '../utils/eventNames';
import { useRootStore } from '../store/common/RootStoreContext';

interface AssistantData {
  _id: string;
  // Add other properties as needed
}

interface PusherEvent {
  message: AssistantData;
}

const CHANNEL_PREFIX = 'sb-';
const NEW_ASSISTANT_DELAY = 100;

const PusherManager: React.FC = observer(() => {
  const rootStore = useRootStore();
  const { activeSessionId } = rootStore.sessionStore;

  const getChannelName = useCallback(
    (sessionId: string) => `${CHANNEL_PREFIX}${sessionId}`,
    []
  );

  useEffect(() => {
    if (!activeSessionId) {
      console.log('No active session ID, not subscribing to Pusher channel');
      return;
    }

    const channelName = getChannelName(activeSessionId);
    console.log(`Subscribing to Pusher channel: ${channelName}`);
    const channel = pusher.subscribe(channelName);

    const handleCreateNewAssistant = async (data: PusherEvent) => {
      try {
        emitter.emit(EVENT_SHOW_ADD_ASSISTANT_MODAL, 'Add Assistant');
        await new Promise((resolve) =>
          setTimeout(resolve, NEW_ASSISTANT_DELAY)
        );
        emitter.emit(EVENT_SET_ASSISTANT_VALUES, data.message);
      } catch (error) {
        console.error('Error handling new assistant creation:', error);
      }
    };

    const handleSetAssistant = (data: PusherEvent) => {
      try {
        emitter.emit(EVENT_SET_ACTIVE_ASSISTANT, data.message._id);
      } catch (error) {
        console.error('Error handling assistant selection:', error);
      }
    };

    channel.bind('createNewAssistant', handleCreateNewAssistant);
    channel.bind('setAssistant', handleSetAssistant);

    return () => {
      console.log(`Unsubscribing from Pusher channel: ${channelName}`);
      channel.unbind('createNewAssistant', handleCreateNewAssistant);
      channel.unbind('setAssistant', handleSetAssistant);
      pusher.unsubscribe(channelName);
    };
  }, [activeSessionId, getChannelName]);

  return null;
});

export default PusherManager;
