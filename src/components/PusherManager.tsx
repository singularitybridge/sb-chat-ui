import React, { useEffect } from 'react';
import { pusher } from '../services/PusherService';
import { emitter } from '../services/mittEmitter';
import {
  EVENT_SHOW_ADD_ASSISTANT_MODAL,
  EVENT_SET_ASSISTANT_VALUES,
  EVENT_SET_ACTIVE_ASSISTANT,
} from '../utils/eventNames';

const PusherManager: React.FC = () => {
  useEffect(() => {
    const channel = pusher.subscribe('sb');

    const handleCreateNewAssistant = async (data: any) => {
      const newAssistantData = data.message;
      emitter.emit(EVENT_SHOW_ADD_ASSISTANT_MODAL, 'Add Assistant');
      await new Promise((resolve) => setTimeout(resolve, 100));
      emitter.emit(EVENT_SET_ASSISTANT_VALUES, newAssistantData);
    };

    const handleSetAssistant = (data: any) => {
      const assistantData = data.message;
      emitter.emit(EVENT_SET_ACTIVE_ASSISTANT, assistantData._id);
    };

    channel.bind('createNewAssistant', handleCreateNewAssistant);
    channel.bind('setAssistant', handleSetAssistant);

    return () => {
      channel.unbind('createNewAssistant', handleCreateNewAssistant);
      channel.unbind('setAssistant', handleSetAssistant);
      pusher.unsubscribe('sb');
    };
  }, []);

  return null; // This component doesn't render anything
};

export default PusherManager;