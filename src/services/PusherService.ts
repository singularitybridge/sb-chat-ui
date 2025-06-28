import Pusher from 'pusher-js';
import { PusherEvent, ChatMessage } from '../types/pusher';
import { emitter } from './mittEmitter';
import * as EventNames from '../utils/eventNames';

const PUSHER_APP_KEY = import.meta.env.VITE_PUSHER_APP_KEY;
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER;

let pusher: Pusher;

type PusherEventHandler = (data: PusherEvent) => void;
type ChatMessageHandler = (data: ChatMessage) => void;
type GenericEventHandler = PusherEventHandler | ChatMessageHandler;

const eventHandlers: Record<string, GenericEventHandler[]> = {};

const initializePusher = () => {
  console.log('🚀 [PUSHER] Initializing Pusher with config:', {
    appKey: PUSHER_APP_KEY,
    cluster: PUSHER_CLUSTER,
    timestamp: new Date().toISOString()
  });
  
  try {
    pusher = new Pusher(PUSHER_APP_KEY, {
      cluster: PUSHER_CLUSTER,
    });

    pusher.connection.bind('error', (err: Error) => {
      console.error('❌ [PUSHER] Connection error:', err);
    });

    pusher.connection.bind('connected', () => {
      console.log('✅ [PUSHER] Connected to Pusher successfully');
    });

    pusher.connection.bind('disconnected', () => {
      console.log('🔌 [PUSHER] Disconnected from Pusher');
    });

    pusher.connection.bind('connecting', () => {
      console.log('🔄 [PUSHER] Connecting to Pusher...');
    });

    pusher.connection.bind('unavailable', () => {
      console.log('❌ [PUSHER] Pusher connection unavailable');
    });

    pusher.connection.bind('failed', () => {
      console.log('❌ [PUSHER] Pusher connection failed');
    });


  } catch (error) {
    console.error('❌ [PUSHER] Error initializing Pusher:', error);
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
  // Special handling for chat_message events that contain action execution data
  if (eventName === 'chat_message') {
    const messageData = data as any;
    
    // Check if this chat_message is actually an action execution update
    if (messageData && messageData.message_type === 'action_execution') {
      console.log('🎯 [PUSHER] Detected action execution in chat_message:', {
        messageId: messageData.id,
        messageType: messageData.message_type,
        actionData: messageData.data,
        status: messageData.data?.status
      });
      
      // IMPORTANT: Action execution messages should be added to chat via the normal chat_message handler
      // The EVENT_ACTION_EXECUTION is only for updating existing messages
      
      // Only emit action execution update if status is NOT 'started'
      // 'started' messages should create new chat messages
      if (messageData.data?.status && messageData.data.status !== 'started') {
        // Transform to action execution format and emit to both handlers
        // Direct pass-through of the data object for action execution updates
        const actionExecutionData = {
          messageId: messageData.data?.messageId || messageData.id,
          actionId: messageData.data?.actionId,
          serviceName: messageData.data?.serviceName,
          actionTitle: messageData.data?.actionTitle,
          actionDescription: messageData.data?.actionDescription,
          icon: messageData.data?.icon,
          originalActionId: messageData.data?.originalActionId,
          status: messageData.data?.status,
          input: messageData.data?.input,
          output: messageData.data?.output,
          error: messageData.data?.error
        };
        
        // Emit as action execution update
        console.log('🔄 [PUSHER] Emitting as action execution UPDATE for existing message:', actionExecutionData);
        emitter.emit(EventNames.EVENT_ACTION_EXECUTION, actionExecutionData);
      } else {
        console.log('📥 [PUSHER] Action execution with status "started" - will be added as new chat message');
      }
    }
    
    // Also handle as regular chat message
    if (eventHandlers[eventName]) {
      eventHandlers[eventName].forEach(handler => (handler as ChatMessageHandler)(data as ChatMessage));
    }
  } else if (eventHandlers[eventName]) {
    eventHandlers[eventName].forEach(handler => (handler as PusherEventHandler)(data as PusherEvent));
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

    channel.bind('pusher:subscription_error', (error: any) => {
      console.error(`Error subscribing to channel ${channelName}:`, error);
    });

    // Add general logging for ALL incoming events
    channel.bind_global((eventName: string, data: any) => {
      
      // Special logging if it contains action execution data
      if (data && typeof data === 'object') {
        if (data.messageType === 'action_execution' || 
            (data.message && data.message.messageType === 'action_execution') ||
            eventName.includes('action')) {
          console.log('🎯 [PUSHER] Potential action execution data found:', {
            eventName,
            dataKeys: Object.keys(data),
            messageType: data.messageType || data.message?.messageType,
            fullData: data
          });
        }
      }
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
  console.log('🔄 [PUSHER] Received action_execution_update event:', data);
  
  // Enhanced logging for debugging
  if (data && typeof data === 'object') {
    console.log('🔍 [PUSHER] Action execution update details:', {
      timestamp: new Date().toISOString(),
      hasMessage: !!data.message,
      messageType: typeof data.message,
      messageKeys: data.message ? Object.keys(data.message) : [],
      fullData: JSON.stringify(data, null, 2)
    });
    
    // Log specific fields if they exist in the message
    if (data.message && typeof data.message === 'object') {
      const msg = data.message as any;
      console.log('📋 [PUSHER] Action execution fields:', {
        messageId: msg.messageId || msg.id || 'NOT_FOUND',
        actionId: msg.actionId || 'NOT_FOUND',
        serviceName: msg.serviceName || 'NOT_FOUND',
        actionTitle: msg.actionTitle || 'NOT_FOUND',
        status: msg.status || 'NOT_FOUND',
        originalActionId: msg.originalActionId || 'NOT_FOUND'
      });
    }
  } else {
    console.warn('⚠️ [PUSHER] Received invalid action_execution_update data:', data);
  }
  
  emitter.emit(EventNames.EVENT_ACTION_EXECUTION, data);
  console.log('📤 [PUSHER] Emitted EVENT_ACTION_EXECUTION to mitt emitter');
});

initializePusher();

export { 
  pusher, 
  subscribeToSessionChannel, 
  unsubscribeFromChannel, 
  addEventHandler, 
  removeEventHandler 
};
