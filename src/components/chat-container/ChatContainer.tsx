import React, { useEffect, useRef, useState } from 'react'; // Keep useState for local assistant state
import { observer } from 'mobx-react';
import { useRootStore } from '../../store/common/RootStoreContext'; // Still needed for rootStore.language, rootStore.assistantsLoaded etc.
import { useChatStore } from '../../store/chatStore'; 
import { useSessionStore } from '../../store/useSessionStore';
import { useAudioStore } from '../../store/useAudioStore';
import { addEventHandler, removeEventHandler } from '../../services/PusherService';
import { ChatMessage as PusherChatMessage } from '../../types/pusher'; // Keep for Pusher type
import {
  // EVENT_CHAT_SESSION_DELETED, // Removed as emitter is not used for this directly here
  EVENT_SET_ACTIVE_ASSISTANT,
  EVENT_ACTION_EXECUTION,
  EVENT_ADD_IFRAME_MESSAGE,
} from '../../utils/eventNames';
import { useEventEmitter } from '../../services/mittEmitter'; // emitter removed
import { IAssistant } from '../../store/models/Assistant';
import { SBChatKitUI } from '../sb-chat-kit-ui/SBChatKitUI';
// import { textToSpeech, TTSVoice } from '../../services/api/voiceService'; // Moved to Zustand store
import i18n from '../../i18n';
import { changeActiveSessionLanguage } from '../../services/api/sessionService';

// ActionExecutionMessage interface might be needed if Pusher payload for EVENT_ACTION_EXECUTION is specific
interface ActionExecutionMessage {
  messageId: string;
  actionId: string;
  serviceName: string;
  actionTitle: string;
  actionDescription: string;
  icon: string;
  originalActionId: string;
  status: 'started' | 'completed' | 'failed';
}


const getDefaultConversationStarters = () => [];

const ChatContainer = observer(() => {
  const rootStore = useRootStore();
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const localAudioRef = useRef<HTMLAudioElement | null>(null); // Local ref for the audio element

  // Zustand store selectors
  const { 
    messages, 
    isLoading,
    isClearing,
    loadMessages: storeLoadMessages,
    addPusherMessage: storeAddPusherMessage,
    handleSubmitMessage: storeHandleSubmitMessage,
    handleClearChat: storeHandleClearChat,
    updateActionExecutionMessage: storeUpdateActionExecutionMessage,
  } = useChatStore();

  // Audio store selectors
  const {
    audioState,
    toggleAudio: storeToggleAudio,
    setAudioRef: storeSetAudioRef,
  } = useAudioStore();

  const [assistant, setAssistant] = useState<IAssistant | undefined>(); // Keep local state for current assistant object

  // Zustand session store selectors
  const { 
    activeSession, 
    changeAssistant: zustandChangeAssistant, 
    clearAndRenewActiveSession: zustandClearAndRenewActiveSession 
  } = useSessionStore();
  const assistantIdFromZustand = activeSession?.assistantId;

  useEffect(() => {
    if (assistantIdFromZustand && rootStore.assistantsLoaded) {
      setAssistant(rootStore.getAssistantById(assistantIdFromZustand));
    } else if (!assistantIdFromZustand) {
      setAssistant(undefined); // Clear local assistant if no active session assistant
    }
  }, [assistantIdFromZustand, rootStore.assistantsLoaded, rootStore]);

  useEffect(() => {
    const setSessionLanguage = async () => {
      // activeSession is from Zustand now, language is from MST rootStore
      if (activeSession) { 
        await changeActiveSessionLanguage(rootStore.language);
        // If language is part of ISession in Zustand, update it there too
        // useSessionStore.getState().setActiveSession({ ...activeSession, language: rootStore.language });
      }
    };
    setSessionLanguage();
  }, [activeSession, rootStore.language]);

  useEffect(() => {
    // Don't load messages if we're in the process of clearing
    if (!isClearing) {
      storeLoadMessages(activeSession?._id); 
    } else {
      console.log('🚫 [CHAT_CONTAINER] Skipping loadMessages during clear operation');
    }
  }, [activeSession?._id, storeLoadMessages, isClearing]);


  useEffect(() => {
    if (activeSession?._id) {
      const handlePusherChatMessage = (pusherMessage: any) => {
        // Special handling for action execution messages
        if (pusherMessage.message_type === 'action_execution' && pusherMessage.data?.status) {
          console.log('🎯 [CHAT_CONTAINER] Handling action execution message:', {
            status: pusherMessage.data.status,
            messageId: pusherMessage.data.messageId,
            actionId: pusherMessage.data.actionId
          });
          
          // Only add as new message if status is 'started'
          // Updates for 'completed' and 'failed' are handled by EVENT_ACTION_EXECUTION
          if (pusherMessage.data.status === 'started') {
            console.log('📥 [CHAT_CONTAINER] Adding new action execution message (started)');
            storeAddPusherMessage(pusherMessage, assistant?._id);
          } else {
            console.log('⏭️ [CHAT_CONTAINER] Skipping addPusherMessage for action execution update (status: ' + pusherMessage.data.status + ')');
          }
        } else {
          // All other message types get added normally
          storeAddPusherMessage(pusherMessage, assistant?._id);
        }
      };

      addEventHandler('chat_message', handlePusherChatMessage);
      
      return () => {
        removeEventHandler('chat_message', handlePusherChatMessage);
      };
    }
  }, [assistant?._id, activeSession?._id, storeAddPusherMessage]);

  const handleAssistantUpdated = async (newAssistantId: string) => {
    await zustandChangeAssistant(newAssistantId); // Use Zustand action
  };

  useEventEmitter<string>(EVENT_SET_ACTIVE_ASSISTANT, handleAssistantUpdated);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]); // messages from Zustand store

  // Submit message handler now calls Zustand action
  const handleSubmit = (messageText: string, fileMetadata?: import('../../types/chat').FileMetadata) => {
    const assistantInfo = assistant ? { _id: assistant._id, voice: assistant.voice, name: assistant.name } : undefined;
    storeHandleSubmitMessage(messageText, assistantInfo, activeSession?._id, fileMetadata);
  };

  // Toggle audio handler now calls audio store action
  const handleToggleAudio = () => {
    storeToggleAudio();
  };

  // Set audio ref in Zustand store
  useEffect(() => {
    if (localAudioRef.current) {
      storeSetAudioRef(localAudioRef);
    }
    // Cleanup for audio element events, if any were set directly (now handled in store or via ref)
    const currentAudioRef = localAudioRef.current;
    if (currentAudioRef) {
      const onEndedCallback = () => {
        // Audio state is managed in the audio store
        const audioStore = useAudioStore.getState();
        if (audioStore.audioState === 'playing') {
          audioStore.toggleAudio();
        }
      };
      currentAudioRef.addEventListener('ended', onEndedCallback);
      return () => {
        currentAudioRef.removeEventListener('ended', onEndedCallback);
      };
    }
  }, [storeSetAudioRef]);


  // Clear chat handler now calls Zustand action, passing the Zustand action
  const handleClear = async () => {
    storeHandleClearChat(
      activeSession?._id, 
      assistant?._id, 
      zustandClearAndRenewActiveSession // Pass Zustand action
    );
  };
  
  // Action execution handler now calls Zustand action
  const handleActionExecution = (actionData: ActionExecutionMessage) => {
    console.log('🎯 [CHAT_CONTAINER] Received action execution data from mitt emitter:', actionData);
    console.log('📊 [CHAT_CONTAINER] Action execution details:', {
      timestamp: new Date().toISOString(),
      messageId: actionData?.messageId || 'NOT_FOUND',
      actionId: actionData?.actionId || 'NOT_FOUND',
      serviceName: actionData?.serviceName || 'NOT_FOUND',
      actionTitle: actionData?.actionTitle || 'NOT_FOUND',
      status: actionData?.status || 'NOT_FOUND',
      originalActionId: actionData?.originalActionId || 'NOT_FOUND',
      actionDataType: typeof actionData,
      actionDataKeys: actionData ? Object.keys(actionData) : []
    });
    
    console.log('🔗 [CHAT_CONTAINER] Calling storeUpdateActionExecutionMessage...');
    storeUpdateActionExecutionMessage(actionData);
    console.log('✅ [CHAT_CONTAINER] storeUpdateActionExecutionMessage call completed');
  };
  useEventEmitter<ActionExecutionMessage>(EVENT_ACTION_EXECUTION, handleActionExecution);

  // Iframe message handler
  useEventEmitter<string>(EVENT_ADD_IFRAME_MESSAGE, (messageText) => {
    handleSubmit(messageText); // Uses the new handleSubmit
  });

  return (
    <div className="h-full w-full bg-zinc-50 rounded-2xl">
      <SBChatKitUI
        messages={messages}
        assistant={ // assistant from local state, derived from MST
          assistant
            ? {
                name: assistant.name,
                description: assistant.description,
                avatar: assistant.avatarImage,
                conversationStarters: assistant.conversationStarters?.length
                  ? assistant.conversationStarters.map(cs => ({ ...cs })) // Ensure plain objects
                  : getDefaultConversationStarters(),
              }
            : undefined
        }
        assistantName="AI Assistant" // This could also come from assistant.name if preferred
        onSendMessage={handleSubmit} // Use new handleSubmit
        onClear={handleClear} // Use new handleClear
        onToggleAudio={handleToggleAudio} // Use new handleToggleAudio
        audioState={audioState}
        isLoading={isLoading}
      />
      <audio ref={localAudioRef} style={{ display: 'none' }} /> {/* Use localAudioRef */}
    </div>
  );
});

export { ChatContainer };
