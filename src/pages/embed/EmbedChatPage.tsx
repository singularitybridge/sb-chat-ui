import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../store/common/RootStoreContext';
import { useSessionStore } from '../../store/useSessionStore';
import { ChatContainer } from '../../components/chat-container/ChatContainer';
import { TextComponent } from '../../components/sb-core-ui-kit/TextComponent';
import { IAssistant } from '../../store/models/Assistant';
import { logger } from '../../services/LoggingService';
import { changeActiveSessionLanguage } from '../../services/api/sessionService'; // Added import

const EmbedChatPage: React.FC = observer(() => {
  const { id: assistantIdFromParams } = useParams<{ id: string }>();
  const rootStore = useRootStore();
  const {
    activeSession,
    fetchActiveSession,
    changeAssistant,
    isLoadingSession,
    setActiveSession, // Added to potentially set session if needed after creation
  } = useSessionStore();

  const [assistant, setAssistant] = useState<IAssistant | undefined>();
  const [isSettingUp, setIsSettingUp] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setupSession = async () => {
      if (!assistantIdFromParams) {
        setError('Assistant ID is missing from URL.');
        setIsSettingUp(false);
        return;
      }

      try {
        // 1. Ensure active session exists or create one
        let currentSession = activeSession;
        if (!currentSession) {
          await fetchActiveSession(); // This will try to get or create a session
          currentSession = useSessionStore.getState().activeSession; // Re-fetch from store after async op
        }

        if (!currentSession) {
          setError('Failed to establish a session.');
          setIsSettingUp(false);
          return;
        }
        
        // Set language for the session
        if (currentSession.language !== rootStore.language) {
          try {
            const updatedSession = await changeActiveSessionLanguage(rootStore.language);
            setActiveSession(updatedSession); // Update session store with new language
            currentSession = updatedSession; // Use updated session for next steps
          } catch (langError) {
            logger.error('Failed to set session language', langError);
            // Continue even if language setting fails, but log it
          }
        }


        // 2. Check if the assistant needs to be changed
        if (currentSession.assistantId !== assistantIdFromParams) {
          await changeAssistant(assistantIdFromParams);
          // activeSession in store will be updated by changeAssistant
        }

        // 3. Fetch assistant details
        if (rootStore.assistantsLoaded) {
          const foundAssistant = rootStore.getAssistantById(assistantIdFromParams);
          if (foundAssistant) {
            setAssistant(foundAssistant);
          } else {
            setError('Assistant not found.');
          }
        } else {
          // If assistants are not loaded, try to load them or the specific one
          // This part might need adjustment based on how assistants are loaded globally
          // For now, assuming they should be loaded by the time this page is accessed or handled by rootStore
          // Ensure assistants are loaded
          await rootStore.loadAssistants(); // Load all assistants
          const loadedAssistant = rootStore.getAssistantById(assistantIdFromParams); // Then get the specific one
          if (loadedAssistant) {
            setAssistant(loadedAssistant);
          } else {
             setError('Assistant not found after attempting to load.');
          }
        }
      } catch (e: any) {
        logger.error('Error setting up embedded chat session:', e);
        setError(`Error setting up session: ${e.message || 'Unknown error'}`);
      } finally {
        setIsSettingUp(false);
      }
    };

    setupSession();
  }, [
    assistantIdFromParams,
    fetchActiveSession,
    changeAssistant,
    rootStore,
    activeSession,
    setActiveSession, // Added setActiveSession to dependency array
  ]);
  
  useEffect(() => {
    // Update local assistant state if the assistantId in the session store changes
    // This covers the case where changeAssistant updates the store, and we need to reflect it locally
    if (activeSession?.assistantId && rootStore.assistantsLoaded) {
      const currentAssistantInSession = rootStore.getAssistantById(activeSession.assistantId);
      if (currentAssistantInSession && currentAssistantInSession._id === assistantIdFromParams) {
        setAssistant(currentAssistantInSession);
      }
    }
  }, [activeSession?.assistantId, rootStore, assistantIdFromParams]);


  if (isLoadingSession || isSettingUp) {
    return (
      <div className="flex justify-center items-center h-screen">
        <TextComponent text="Setting up chat..." size="medium" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <TextComponent text={`Error: ${error}`} size="medium" color="alert" />
      </div>
    );
  }

  if (!assistant) {
    return (
      <div className="flex justify-center items-center h-screen">
        <TextComponent text="Assistant not available." size="medium" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-50">
      <ChatContainer />
    </div>
  );
});

export default EmbedChatPage;
