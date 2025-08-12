import { create } from 'zustand';
import Vapi from '@vapi-ai/web';
import { vapiConfig } from '../config/vapi.config';

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
  processAIResponse: (query: string, sessionId: string, assistantId: string) => Promise<void>;
  
  // Internal actions
  addMessage: (message: VapiMessage) => void;
  setCurrentTranscript: (transcript: string) => void;
  setCurrentResponse: (response: VapiResponse | null) => void;
  setUserAudioLevel: (level: number) => void;
  setAssistantAudioLevel: (level: number) => void;
  cleanup: () => void;
}

const useVapiStore = create<VapiStore>((set, get) => ({
  // Initial state
  vapi: null,
  isCallActive: false,
  isConnecting: false,
  isMuted: false,
  isSpeaking: false,
  isListening: false,
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
        console.log('VAPI call started');
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
        set({ isSpeaking: true, isListening: false });
      });
      
      vapiInstance.on('speech-end', () => {
        set({ isSpeaking: false });
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
      vapiInstance.on('message', (message: any) => {
        console.debug('VAPI message received:', message);
        
        if (message.type === 'transcript') {
          const { transcript } = message;
          const vapiMessage: VapiMessage = {
            type: transcript.role === 'user' ? 'user' : 'assistant',
            content: transcript.text,
            timestamp: new Date(),
            metadata: message
          };
          
          get().addMessage(vapiMessage);
          
          // Process user input through our AI backend
          if (transcript.role === 'user') {
            set({ isListening: true, currentTranscript: transcript.text });
            
            // Get session info from the chat store
            const sessionId = localStorage.getItem('activeSessionId');
            const assistantId = localStorage.getItem('activeAssistantId');
            
            if (sessionId && assistantId) {
              get().processAIResponse(transcript.text, sessionId, assistantId);
            }
          } else if (transcript.role === 'assistant') {
            set({ 
              currentTranscript: '',
              isListening: false 
            });
          }
        }
        
        if (message.type === 'conversation-update') {
          // Handle conversation updates
          console.debug('Conversation update:', message);
        }
        
        if (message.type === 'function-call') {
          // Handle function calls if needed
          console.debug('Function call:', message);
        }
      });
      
      vapiInstance.on('error', (error: any) => {
        console.error('VAPI error:', error);
        set({ 
          isCallActive: false,
          isConnecting: false
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
      
      // Start with custom assistant config or use default from config
      if (vapiConfig.assistantId) {
        // Use pre-configured assistant
        await vapi.start(vapiConfig.assistantId, {
          variableValues: {
            sessionId: sessionId || 'default',
            assistantId: assistantId || 'default'
          }
        });
      } else {
        // Use inline assistant configuration
        await vapi.start({
          model: {
            provider: 'openai' as const,
            model: 'gpt-4-turbo' as const,
            temperature: 0.7,
            messages: [
              {
                role: 'system' as const,
                content: `You are a helpful AI assistant integrated with the screen sharing workspace. 
                Keep your spoken responses concise (1-2 sentences) for voice interactions.
                When asked complex questions, provide brief verbal summaries.
                Current session ID: ${sessionId || 'default'}
                Current assistant ID: ${assistantId || 'default'}`
              }
            ]
          },
          voice: {
            provider: '11labs' as const,
            voiceId: 'EXAVITQu4vr4xnSDxMaL'
          },
          firstMessage: 'Hello! I can see your screen. How can I help you today?'
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
  
  // Process AI response through our backend
  processAIResponse: async (query: string, sessionId: string, assistantId: string) => {
    try {
      // Import the assistant service
      const { handleUserInput } = await import('../services/api/assistantService');
      
      // Call our backend API for AI processing
      const response = await handleUserInput({
        userInput: query,
        // Add metadata to indicate this is from voice
        attachments: []
      });
      
      // Create response object
      const vapiResponse: VapiResponse = {
        query,
        shortResponse: response.substring(0, 150) + (response.length > 150 ? '...' : ''),
        fullResponse: response,
        timestamp: new Date()
      };
      
      set({ currentResponse: vapiResponse });
      
      // Send the response to VAPI to speak
      const { vapi } = get();
      if (vapi && response) {
        // Use the short response for voice
        vapi.say(vapiResponse.shortResponse);
      }
      
      console.debug('AI response processed:', vapiResponse);
      
    } catch (error) {
      console.error('Failed to process AI response:', error);
      
      // Fallback response
      const { vapi } = get();
      if (vapi) {
        vapi.say("I'm having trouble processing that request. Please try again.");
      }
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
      messages: [],
      currentTranscript: '',
      currentResponse: null,
      userAudioLevel: 0,
      assistantAudioLevel: 0
    });
  }
}));

export default useVapiStore;