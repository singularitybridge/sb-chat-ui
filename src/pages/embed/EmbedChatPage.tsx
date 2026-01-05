import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { useSessionStore } from '../../store/useSessionStore';
import { useAssistantStore } from '../../store/useAssistantStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { ChatContainer } from '../../components/chat-container/ChatContainer';
import { TextComponent } from '../../components/sb-core-ui-kit/TextComponent';
import { IAssistant } from '../../types/entities';
import { logger } from '../../services/LoggingService';
import { changeActiveSessionLanguage } from '../../services/api/sessionService';
import { useEmbedAuth } from '../../contexts/EmbedAuthContext';
import { setGlobalEmbedApiKey } from '../../services/AxiosService';

const EmbedChatPage: React.FC = () => {
  const { id: assistantIdFromParams } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { setApiKey: setEmbedApiKey } = useEmbedAuth();
  const { language, setLanguage } = useLanguageStore();
  const { assistants, assistantsLoaded, loadAssistants, getAssistantById } = useAssistantStore();
  const {
    activeSession,
    fetchActiveSession,
    changeAssistant,
    isLoadingSession,
    setActiveSession,
  } = useSessionStore();

  const [assistant, setAssistant] = useState<IAssistant | undefined>();
  const [isSettingUp, setIsSettingUp] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setupSession = async () => {
      setIsSettingUp(true);
      setError(null);

      // Embedded chats always use English
      // Set the UI language to English if it's not already
      if (language !== 'en') {
        await setLanguage('en');
      }

      const apiKeyFromUrl = searchParams.get('apiKey');
      if (apiKeyFromUrl) {
        setEmbedApiKey(apiKeyFromUrl);
        setGlobalEmbedApiKey(apiKeyFromUrl);
      } else {
        setError('API key is missing from URL.');
        setIsSettingUp(false);
        setGlobalEmbedApiKey(null);
        return;
      }

      if (!assistantIdFromParams) {
        setError('Assistant ID is missing from URL.');
        setIsSettingUp(false);
        return;
      }

      try {
        // Step 1: Fetch or create session.
        // Directly use the result of fetchActiveSession for the most current data.
        let workingSession = await fetchActiveSession();

        if (!workingSession || !workingSession._id) {
          // Check store's isApiKeyMissing flag or other indicators if fetch returns null
          const isKeyMissing = useSessionStore.getState().isApiKeyMissing;
          setError(isKeyMissing ? 'API key may be invalid or missing.' : 'Failed to establish a valid session.');
          setIsSettingUp(false);
          // Ensure activeSession in store is also null if we couldn't get one
          if (!useSessionStore.getState().activeSession?._id) {
             setActiveSession(null);
          }
          return;
        }
        
        // Session is valid, update the store immediately.
        // This ensures PusherManager and other dependents see a valid session ASAP.
        setActiveSession(workingSession);

        // Step 2: Set language for the session to English if different
        if (workingSession.language !== 'en') {
          try {
            // Call API to change language to English. We won't directly use its return value
            // to reconstruct the whole session, to avoid issues if it's incomplete.
            await changeActiveSessionLanguage('en'); 
            
            // If API call successful, assume language is updated on backend.
            // Update our current workingSession's language property locally to English.
            // The _id and assistantId remain from the valid workingSession.
            workingSession.language = 'en';
            
            // Now, set this updated workingSession in the store.
            // setActiveSession will validate it. Since _id and assistantId are from a previously
            // validated session, and language is now explicitly set, it should be valid.
            setActiveSession(workingSession); 

            // Optionally, re-sync workingSession from store to be absolutely sure,
            // though setActiveSession should make the store consistent with workingSession.
            const storeSessionAfterLangUpdate = useSessionStore.getState().activeSession;
            if (storeSessionAfterLangUpdate && storeSessionAfterLangUpdate._id) {
                workingSession = storeSessionAfterLangUpdate;
            } else {
                // This would be unexpected if setActiveSession(workingSession) above worked.
                logger.error('Session became null in store after updating language locally and setting.', { localWorkingSession: workingSession });
                // This state will be caught by the check below.
            }

          } catch (langError) {
            logger.error('API call to set session language failed.', langError);
            // If API call fails, workingSession is not changed, and store's activeSession is also not changed by this block.
            // No need to re-assign workingSession from store here, as no successful change was made by this block.
          }
        }

        // Step 3: Change assistant if necessary
        // Ensure workingSession is still valid after potential language change attempt
        if (!workingSession || !workingSession._id) {
            setError('Session became invalid after language update. Please try again.');
            setIsSettingUp(false);
            return;
        }
        
        if (workingSession.assistantId !== assistantIdFromParams) {
          await changeAssistant(assistantIdFromParams); // This updates the session in the store
          // Refresh workingSession from the store after assistant change
          const newStoreSession = useSessionStore.getState().activeSession;
          if (newStoreSession && newStoreSession._id) {
            workingSession = newStoreSession; // Update working copy to the latest from store
          } else {
            // This should ideally not happen if changeAssistant is robust
            setError('Session became invalid after changing assistant.');
            setIsSettingUp(false);
            return;
          }
        }
        
        // Final check on session consistency before fetching assistant details
        if (!workingSession || !workingSession._id || workingSession.assistantId !== assistantIdFromParams) {
            setError('Session state is inconsistent before loading assistant. Please try again.');
            setIsSettingUp(false);
            return;
        }

        // Step 4: Fetch assistant details
        if (assistantsLoaded) {
          const foundAssistant = getAssistantById(assistantIdFromParams);
          if (foundAssistant) {
            setAssistant(foundAssistant);
          } else {
            setError('Assistant not found.');
          }
        } else {
          await loadAssistants();
          const loadedAssistant = useAssistantStore.getState().getAssistantById(assistantIdFromParams);
          if (loadedAssistant) {
            setAssistant(loadedAssistant);
          } else {
             setError('Assistant not found after attempting to load.');
          }
        }
      } catch (e: any) {
        logger.error('Error setting up embedded chat session:', e);
        setError(`Error setting up session: ${e.message || 'Unknown error'}`);
        // Ensure store's active session is nulled out on critical failure
        setActiveSession(null);
      } finally {
        setIsSettingUp(false);
      }
    };

    setupSession();
  }, [
    assistantIdFromParams,
    searchParams,
    fetchActiveSession,
    changeAssistant,
    setActiveSession,
    setEmbedApiKey,
    setLanguage,
    language,
    assistantsLoaded,
    getAssistantById,
    loadAssistants
  ]);

  // Cleanup global API key when component unmounts
  useEffect(() => {
    return () => {
      setGlobalEmbedApiKey(null);
    };
  }, []);
  
  // This effect synchronizes the local `assistant` state with the one derived from `activeSession`
  // This is important if `activeSession.assistantId` changes due to external factors or deep store logic
  // not directly managed by the `setupSession`'s `workingSession` variable.
  useEffect(() => {
    const currentStoreSession = useSessionStore.getState().activeSession;
    if (currentStoreSession?.assistantId && currentStoreSession._id && assistantsLoaded) {
      if (currentStoreSession.assistantId === assistantIdFromParams) {
        const assistantFromStore = getAssistantById(currentStoreSession.assistantId);
        if (assistantFromStore) {
          setAssistant(assistantFromStore);
        } else if (!error && !isSettingUp) {
            setError(`Assistant with ID ${currentStoreSession.assistantId} not found.`);
        }
      }
    } else if (!currentStoreSession?._id && !error && !isSettingUp) {
        // If session is gone from store and not in error/setup, reflect this.
    }
  }, [activeSession?._id, activeSession?.assistantId, assistantsLoaded, assistantIdFromParams, getAssistantById, error, isSettingUp]);


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
    // This state could be reached if setup completes but assistant couldn't be found, and error wasn't set explicitly for it.
    return (
      <div className="flex justify-center items-center h-screen">
        <TextComponent text="Assistant not available or failed to load." size="medium" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-50">
      <ChatContainer />
    </div>
  );
};

export default EmbedChatPage;
