import Pusher from 'pusher-js';
import { PusherEvent, ChatMessage } from '../types/pusher';
import { emitter } from './mittEmitter';
import * as EventNames from '../utils/eventNames';

const PUSHER_APP_KEY = '7e8897731876adb4652f';
const PUSHER_CLUSTER = 'eu';

let pusher: Pusher;

type PusherEventHandler = (data: PusherEvent) => void;
type ChatMessageHandler = (data: ChatMessage) => void;
type GenericEventHandler = PusherEventHandler | ChatMessageHandler;

const eventHandlers: Record<string, GenericEventHandler[]> = {};

const initializePusher = () => {
  try {
    pusher = new Pusher(PUSHER_APP_KEY, {
      cluster: PUSHER_CLUSTER,
    });

    pusher.connection.bind('error', (err: Error) => {
      console.error('Pusher connection error:', err);
    });

    pusher.connection.bind('connected', () => {
      console.log('Connected to Pusher');
    });

    pusher.connection.bind('disconnected', () => {
      console.log('Disconnected from Pusher');
    });

  } catch (error) {
    console.error('Error initializing Pusher:', error);
  }
};

const addEventHandler = (eventName: string, handler: GenericEventHandler) => {
  if (!eventHandlers[eventName]) {
    eventHandlers[eventName] = [];
  }
  eventHandlers[eventName].push(handler);
};

const removeEventHandler = (eventName: string, handler: GenericEventHandler) => {
  if (eventHandlers[eventName]) {
    eventHandlers[eventName] = eventHandlers[eventName].filter(h => h !== handler);
  }
};

const handleEvent = (eventName: string, data: PusherEvent | ChatMessage) => {
  if (eventHandlers[eventName]) {
    if (eventName === 'chat_message') {
      eventHandlers[eventName].forEach(handler => (handler as ChatMessageHandler)(data as ChatMessage));
    } else {
      eventHandlers[eventName].forEach(handler => (handler as PusherEventHandler)(data as PusherEvent));
    }
  }
};

const subscribeToSessionChannel = (sessionId: string) => {
  if (!pusher) {
    console.error('Pusher not initialized');
    return null;
  }

  const channelName = `sb-${sessionId}`;
  
  try {
    const channel = pusher.subscribe(channelName);

    channel.bind('pusher:subscription_succeeded', () => {
      console.log(`Subscribed to channel: ${channelName}`);
    });

    channel.bind('pusher:subscription_error', (error: any) => {
      console.error(`Error subscribing to channel ${channelName}:`, error);
    });

    // Bind all event handlers
    Object.keys(eventHandlers).forEach(eventName => {
      if (eventName === 'chat_message') {
        channel.bind(eventName, (data: ChatMessage) => handleEvent(eventName, data));
      } else {
        channel.bind(eventName, (data: PusherEvent) => handleEvent(eventName, data));
      }
    });

    return channel;
  } catch (error) {
    console.error(`Error subscribing to channel ${channelName}:`, error);
    return null;
  }
};

const unsubscribeFromChannel = (channelName: string) => {
  if (!pusher) {
    console.error('Pusher not initialized');
    return;
  }

  try {
    pusher.unsubscribe(channelName);
    console.log(`Unsubscribed from channel: ${channelName}`);
  } catch (error) {
    console.error(`Error unsubscribing from channel ${channelName}:`, error);
  }
};

// Default event handlers
addEventHandler('createNewAssistant', (data: PusherEvent) => {
  setTimeout(() => {
    emitter.emit(EventNames.EVENT_SET_ASSISTANT_VALUES, data.message);
  }, 100);
});

addEventHandler('setAssistant', (data: PusherEvent) => {
  console.log('Received setAssistant event. Data:', data);
  if (data && typeof data === 'object' && '_id' in data) {
    const assistantId = data._id as string;
    console.log('Emitting EVENT_SET_ACTIVE_ASSISTANT with _id:', assistantId);
    emitter.emit(EventNames.EVENT_SET_ACTIVE_ASSISTANT, assistantId);
  } else {
    console.error('Received data does not contain _id property:', data);
  }
});

addEventHandler('action_execution_update', (data: PusherEvent) => {
  console.log('Received action_execution_update event:', data);
  emitter.emit(EventNames.EVENT_ACTION_EXECUTION, data);
});

initializePusher();

export { 
  pusher, 
  subscribeToSessionChannel, 
  unsubscribeFromChannel, 
  addEventHandler, 
  removeEventHandler 
};
