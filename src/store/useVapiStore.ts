import { create } from 'zustand';
import Vapi from '@vapi-ai/web';
import { vapiConfig } from '../config/vapi.config';
import { useChatStore } from './chatStore';

interface VapiMessage {
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: any;
}

interface VapiResponse {
  query: string;
  shortResponse: string;
  fullResponse: string;
  timestamp: Date;
}

interface VapiStore {
  // VAPI instance
  vapi: Vapi | null;
  
  // Call state
  isCallActive: boolean;
  isConnecting: boolean;
  isMuted: boolean;
  
  // Voice activity
  isSpeaking: boolean;
  isListening: boolean;
  isProcessing: boolean;
  
  // Messages and transcripts
  messages: VapiMessage[];
  currentTranscript: string;
  currentResponse: VapiResponse | null;
  
  // Audio levels
  userAudioLevel: number;
  assistantAudioLevel: number;
  
  // Actions
  initializeVapi: () => void;
  startCall: (sessionId?: string, assistantId?: string) => Promise<void>;
  endCall: () => void;
  toggleMute: () => void;
  sendMessage: (message: string) => void;
  processAIResponse: (query: string, sessionId: string, assistantId: string) => Promise<any>;
  
  // Internal actions
  addMessage: (message: VapiMessage) => void;
  setCurrentTranscript: (transcript: string) => void;
  setCurrentResponse: (response: VapiResponse | null) => void;
  setUserAudioLevel: (level: number) => void;
  setAssistantAudioLevel: (level: number) => void;
  cleanup: () => void;
}

// Helper function to make responses more conversational
const makeConversational = (response: string): string => {
  // Remove markdown formatting for voice
  let conversational = response
    .replace(/#{1,6}\s/g, '') // Remove headers
    .replace(/\*\*/g, '') // Remove bold
    .replace(/\*/g, '') // Remove italics
    .replace(/```[\s\S]*?```/g, 'I\'ve shown you some code.') // Replace code blocks
    .replace(/`/g, '') // Remove inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
    .replace(/\n{2,}/g, '. ') // Replace multiple newlines with periods
    .replace(/\n/g, ' '); // Replace single newlines with spaces
  
  // Shorten if too long (more than 2-3 sentences for voice)
  const sentences = conversational.split(/[.!?]+/).filter(s => s.trim());
  if (sentences.length > 3) {
    // Take first 2-3 sentences and add a summary indicator
    conversational = sentences.slice(0, 3).join('. ') + '. I\'ve displayed more details in the chat.';
  }
  
  return conversational;
};

const useVapiStore = create<VapiStore>((set, get) => ({
  // Initial state
  vapi: null,
  isCallActive: false,
  isConnecting: false,
  isMuted: false,
  isSpeaking: false,
  isListening: false,
  isProcessing: false,
  messages: [],
  currentTranscript: '',
  currentResponse: null,
  userAudioLevel: 0,
  assistantAudioLevel: 0,
  
  // Initialize VAPI
  initializeVapi: () => {
    const { vapi } = get();
    if (vapi) return;
    
    try {
      const vapiInstance = new Vapi(vapiConfig.publicKey);
      
      // Set up event listeners
      vapiInstance.on('call-start', () => {
        console.log('✅ VAPI call started - listening for speech...');
        set({ 
          isCallActive: true, 
          isConnecting: false,
          messages: []
        });
      });
      
      vapiInstance.on('call-end', () => {
        console.log('VAPI call ended');
        set({ 
          isCallActive: false,
          isConnecting: false,
          isSpeaking: false,
          isListening: false,
          currentTranscript: ''
        });
      });
      
      vapiInstance.on('speech-start', () => {
        console.log('🔊 Assistant started speaking');
        set({ isSpeaking: true, isListening: false });
      });
      
      vapiInstance.on('speech-end', () => {
        console.log('🔇 Assistant stopped speaking');
        set({ isSpeaking: false });
      });
      
      // Add more event listeners for debugging
      vapiInstance.on('transcript' as any, (transcript: any) => {
        console.log('📜 Direct transcript event:', transcript);
      });
      
      vapiInstance.on('conversation-update' as any, (update: any) => {
        console.log('💬 Conversation update:', update);
      });
      
      vapiInstance.on('volume-level', (level: number) => {
        // Update audio levels for visual feedback
        const { isSpeaking } = get();
        if (isSpeaking) {
          set({ assistantAudioLevel: level });
        } else {
          set({ userAudioLevel: level });
        }
      });
      
      // Handle messages
      vapiInstance.on('message', async (message: any) => {
        console.log('🎤 VAPI message received:', message.type, message);
        
        // Handle all transcript types
        if (message.type === 'transcript') {
          const { role, transcript, transcriptType } = message;
          console.log(`📝 Transcript - Role: ${role}, Type: ${transcriptType}, Text: "${transcript}"`);
          
          // Process user transcripts (both partial and final)
          if (role === 'user' && transcript && transcript.trim()) {
            console.log('🗣️ User said:', transcript);
            
            // Only process final transcripts to avoid multiple calls
            if (transcriptType === 'final') {
              set({ isListening: true, currentTranscript: transcript, isProcessing: true });
            
              // Add user message to local history
              const userMessage: VapiMessage = {
                type: 'user',
                content: transcript,
                timestamp: new Date(),
                metadata: message
              };
              get().addMessage(userMessage);
              
              // IMMEDIATELY process through our AI backend
              try {
                const sessionId = localStorage.getItem('activeSessionId');
                const assistantId = localStorage.getItem('activeAssistantId');
                
                console.log('🤖 Processing with AI agent...');
                // Process through our AI backend
                const response = await get().processAIResponse(
                  transcript,
                  sessionId || '',
                  assistantId || ''
                );
                
                console.log('✅ AI Response received:', response);
                
                // Tell VAPI to speak the response
                if (response && vapiInstance) {
                  // Interrupt any current speech and say our response
                  vapiInstance.say(response.shortResponse);
                  console.log('🔊 Told VAPI to speak:', response.shortResponse);
                }
                
                set({ isProcessing: false, currentTranscript: '' });
              } catch (error) {
                console.error('Error processing user message:', error);
                set({ isProcessing: false });
                
                // Tell VAPI about the error
                if (vapiInstance) {
                  vapiInstance.say("I'm having trouble processing that request. Please try again.");
                }
              }
            }
          }
        }
        
        // Also handle voice-input events (user speech detection)
        if (message.type === 'voice-input' && message.input) {
          console.log('🎙️ Voice input detected:', message.input);
          
          set({ isListening: true, currentTranscript: message.input, isProcessing: true });
          
          // Add user message to local history
          const userMessage: VapiMessage = {
            type: 'user',
            content: message.input,
            timestamp: new Date(),
            metadata: message
          };
          get().addMessage(userMessage);
          
          // Process through our AI backend
          try {
            const sessionId = localStorage.getItem('activeSessionId');
            const assistantId = localStorage.getItem('activeAssistantId');
            
            console.log('🤖 Processing voice input with AI agent...');
            const response = await get().processAIResponse(
              message.input,
              sessionId || '',
              assistantId || ''
            );
            
            console.log('✅ AI Response for voice input:', response);
            
            // Tell VAPI to speak the response
            if (response && vapiInstance) {
              // Interrupt and speak our response immediately
              vapiInstance.say(response.shortResponse, false);
              console.log('🔊 Speaking AI response:', response.shortResponse);
            }
            
            set({ isProcessing: false, currentTranscript: '' });
          } catch (error) {
            console.error('Error processing voice input:', error);
            set({ isProcessing: false });
            
            if (vapiInstance) {
              vapiInstance.say("I'm having trouble processing that request. Please try again.");
            }
          }
        }
        
        if (message.type === 'conversation-update') {
          // Handle conversation updates
          console.debug('Conversation update:', message);
        }
      });
      
      // Catch ALL events for debugging
      const originalEmit = (vapiInstance as any).emit;
      (vapiInstance as any).emit = function(event: string, ...args: any[]) {
        if (!['volume-level'].includes(event)) { // Skip noisy events
          console.log(`🔵 VAPI Event: ${event}`, args);
        }
        return originalEmit.apply(vapiInstance, [event as any, ...args]);
      };
      
      vapiInstance.on('error', (error: any) => {
        console.error('❌ VAPI error:', error);
        set({ 
          isCallActive: false,
          isConnecting: false,
          isProcessing: false
        });
      });
      
      set({ vapi: vapiInstance });
      console.log('VAPI initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize VAPI:', error);
    }
  },
  
  // Start a voice call
  startCall: async (sessionId?: string, assistantId?: string) => {
    const { vapi, isCallActive } = get();
    if (!vapi || isCallActive) return;
    
    set({ isConnecting: true });
    
    try {
      // Store session info for later use
      if (sessionId) localStorage.setItem('activeSessionId', sessionId);
      if (assistantId) localStorage.setItem('activeAssistantId', assistantId);
      
      // Start with the configured assistant ID
      if (vapiConfig.assistantId) {
        console.log('🚀 Starting VAPI with assistant ID:', vapiConfig.assistantId);
        await vapi.start(vapiConfig.assistantId);
        console.log('✅ VAPI started with pre-configured assistant');
      } else {
        // Fallback to inline configuration
        await vapi.start({
          model: {
            provider: 'openai' as const,
            model: 'gpt-4-turbo' as const,
            temperature: 0.7,
            messages: [
              {
                role: 'system' as const,
                content: vapiConfig.assistant.model.messages[0].content
              }
            ]
          },
          voice: {
            provider: '11labs' as const,
            voiceId: 'EXAVITQu4vr4xnSDxMaL'
          },
          firstMessage: vapiConfig.assistant.firstMessage
        } as any);
      }
      
      console.log('VAPI call started successfully');
    } catch (error) {
      console.error('Failed to start VAPI call:', error);
      set({ isConnecting: false });
    }
  },
  
  // End the voice call
  endCall: () => {
    const { vapi, isCallActive } = get();
    if (!vapi || !isCallActive) return;
    
    try {
      vapi.stop();
      console.log('VAPI call ended');
    } catch (error) {
      console.error('Failed to end VAPI call:', error);
    }
  },
  
  // Toggle mute
  toggleMute: () => {
    const { vapi, isMuted } = get();
    if (!vapi) return;
    
    const newMutedState = !isMuted;
    vapi.setMuted(newMutedState);
    set({ isMuted: newMutedState });
    console.debug(`Microphone ${newMutedState ? 'muted' : 'unmuted'}`);
  },
  
  // Send a text message
  sendMessage: (message: string) => {
    const { vapi, isCallActive } = get();
    if (!vapi || !isCallActive) return;
    
    vapi.send({
      type: 'add-message',
      message: {
        role: 'user',
        content: message
      }
    });
    
    get().addMessage({
      type: 'user',
      content: message,
      timestamp: new Date()
    });
  },
  
  // Process AI response through our backend and sync with chat
  processAIResponse: async (query: string, sessionId: string, assistantId: string) => {
    try {
      // Import services
      const { handleUserInput } = await import('../services/api/assistantService');
      const chatStore = useChatStore.getState();
      
      // First, add the user message to the chat UI
      if (sessionId && assistantId) {
        // Add user message to chat
        await chatStore.handleSubmitMessage(
          query,
          { _id: assistantId, voice: undefined, name: 'AI Assistant' },
          sessionId,
          undefined
        );
      } else {
        // If no session, just process the query
        const response = await handleUserInput({
          userInput: query,
          attachments: []
        });
        
        // Create response object
        const vapiResponse: VapiResponse = {
          query,
          shortResponse: makeConversational(response),
          fullResponse: response,
          timestamp: new Date()
        };
        
        set({ currentResponse: vapiResponse });
        
        // Add assistant message to local history
        get().addMessage({
          type: 'assistant',
          content: response,
          timestamp: new Date()
        });
        
        return vapiResponse;
      }
      
      // The chat store will handle the streaming response
      // We'll wait a bit for the response to start streaming
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the latest message from chat store
      const messages = chatStore.messages;
      const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
      
      if (lastAssistantMessage) {
        const vapiResponse: VapiResponse = {
          query,
          shortResponse: makeConversational(lastAssistantMessage.content),
          fullResponse: lastAssistantMessage.content,
          timestamp: new Date()
        };
        
        set({ currentResponse: vapiResponse });
        
        // Add to local voice chat history
        get().addMessage({
          type: 'assistant',
          content: lastAssistantMessage.content,
          timestamp: new Date()
        });
        
        return vapiResponse;
      }
      
      // Fallback if no response found
      return {
        query,
        shortResponse: "I'm processing your request.",
        fullResponse: "Processing...",
        timestamp: new Date()
      };
      
    } catch (error) {
      console.error('Failed to process AI response:', error);
      
      const errorResponse = {
        query,
        shortResponse: "I'm having trouble processing that request.",
        fullResponse: "Error: Failed to process your request. Please try again.",
        timestamp: new Date()
      };
      
      set({ currentResponse: errorResponse });
      return errorResponse;
    }
  },
  
  // Add a message to the history
  addMessage: (message: VapiMessage) => {
    set(state => ({
      messages: [...state.messages, message]
    }));
  },
  
  // Set current transcript
  setCurrentTranscript: (transcript: string) => {
    set({ currentTranscript: transcript });
  },
  
  // Set current response
  setCurrentResponse: (response: VapiResponse | null) => {
    set({ currentResponse: response });
  },
  
  // Set user audio level
  setUserAudioLevel: (level: number) => {
    set({ userAudioLevel: level });
  },
  
  // Set assistant audio level
  setAssistantAudioLevel: (level: number) => {
    set({ assistantAudioLevel: level });
  },
  
  // Cleanup
  cleanup: () => {
    const { vapi, isCallActive } = get();
    if (vapi && isCallActive) {
      vapi.stop();
    }
    
    localStorage.removeItem('activeSessionId');
    localStorage.removeItem('activeAssistantId');
    
    set({
      vapi: null,
      isCallActive: false,
      isConnecting: false,
      isMuted: false,
      isSpeaking: false,
      isListening: false,
      isProcessing: false,
      messages: [],
      currentTranscript: '',
      currentResponse: null,
      userAudioLevel: 0,
      assistantAudioLevel: 0
    });
  }
}));

export default useVapiStore;