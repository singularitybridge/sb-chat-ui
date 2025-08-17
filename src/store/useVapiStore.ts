import { create } from 'zustand';
import Vapi from '@vapi-ai/web';
import { vapiConfig } from '../config/vapi.config';

interface VapiMessage {
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface VapiStore {
  vapi: Vapi | null;
  isCallActive: boolean;
  isConnecting: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  currentTranscript: string;
  messages: VapiMessage[];
  
  initializeVapi: () => void;
  startCall: (sessionId?: string, assistantId?: string) => Promise<void>;
  endCall: () => void;
  toggleMute: () => void;
  cleanup: () => void;
}

const useVapiStore = create<VapiStore>((set, get) => ({
  vapi: null,
  isCallActive: false,
  isConnecting: false,
  isMuted: false,
  isSpeaking: false,
  isListening: false,
  currentTranscript: '',
  messages: [],
  
  initializeVapi: () => {
    const { vapi } = get();
    if (vapi) return;
    
    // Don't initialize if no public key
    if (!vapiConfig.publicKey) {
      console.warn('VAPI public key not configured');
      return;
    }
    
    try {
      const vapiInstance = new Vapi(vapiConfig.publicKey);
      
      // Core event handlers
      vapiInstance.on('call-start', () => {
        console.log('✅ VAPI call started');
        set({ 
          isCallActive: true, 
          isConnecting: false,
          messages: []
        });
      });
      
      vapiInstance.on('call-end', () => {
        console.log('📵 VAPI call ended');
        set({ 
          isCallActive: false,
          isConnecting: false,
          isSpeaking: false,
          isListening: false,
          currentTranscript: ''
        });
      });
      
      vapiInstance.on('speech-start', () => {
        console.log('🔊 Assistant speaking');
        set({ isSpeaking: true, isListening: false });
      });
      
      vapiInstance.on('speech-end', () => {
        console.log('🔇 Assistant stopped speaking');
        set({ isSpeaking: false });
      });
      
      // Handle messages for UI updates ONLY - NO backend calls with custom-llm
      vapiInstance.on('message', (message: any) => {
        // Only log non-volume messages
        if (message?.type !== 'volume-level') {
          console.log('📨 VAPI message:', message.type, message);
        }
        
        if (message.type === 'transcript') {
          const { role, transcript, transcriptType } = message;
          
          // Handle user transcripts
          if (role === 'user' && transcript) {
            if (transcriptType === 'partial') {
              // Show what user is saying in real-time
              set({ currentTranscript: transcript, isListening: true });
            } else if (transcriptType === 'final') {
              console.log('📝 Final user transcript:', transcript);
              set({ currentTranscript: '', isListening: false });
              
              // Add to message history for UI
              set(state => ({
                messages: [...state.messages, {
                  type: 'user',
                  content: transcript,
                  timestamp: new Date()
                }]
              }));
              
              // CRITICAL: With custom-llm, VAPI automatically sends to our proxy
              // DO NOT make manual backend calls here!
              // Optionally show processing message
              const { vapi } = get();
              if (vapi) {
                // Use single argument only - second arg ends the call!
                vapi.say('Processing your request, please wait.');
              }
            }
          }
          
          // Handle assistant responses from our custom LLM proxy
          if (role === 'assistant' && transcript) {
            if (transcriptType === 'final') {
              console.log('🤖 Assistant response from proxy:', transcript);
              // Add assistant response to history
              set(state => ({
                messages: [...state.messages, {
                  type: 'assistant',
                  content: transcript,
                  timestamp: new Date()
                }]
              }));
            }
          }
        }
        
        // Handle assistant messages (alternative event type)
        if (message.type === 'assistant-message') {
          const content = message.message?.content || message.content || '';
          console.log('✅ Assistant message from custom LLM:', content);
          
          // Add to message history if not already there
          const { messages } = get();
          const lastMessage = messages[messages.length - 1];
          if (!lastMessage || lastMessage.content !== content) {
            set(state => ({
              messages: [...state.messages, {
                type: 'assistant',
                content: content,
                timestamp: new Date()
              }]
            }));
          }
        }
        
        // Handle conversation updates
        if (message.type === 'conversation-update') {
          console.log('💬 Conversation update:', message);
        }
        
        // Log any custom-llm errors
        if (message.type === 'error' && message.error?.includes('custom-llm')) {
          console.error('❌ Custom LLM error:', message.error);
        }
      });
      
      vapiInstance.on('error', (error: any) => {
        console.error('❌ VAPI error:', error);
        // Check for custom-llm specific errors
        const errorString = JSON.stringify(error);
        if (errorString.includes('custom-llm')) {
          console.error('Custom LLM specific error - check if proxy URL is accessible');
        }
        set({ 
          isCallActive: false,
          isConnecting: false
        });
      });
      
      set({ vapi: vapiInstance });
      console.log('✅ VAPI initialized');
      
    } catch (error) {
      console.error('Failed to initialize VAPI:', error);
    }
  },
  
  startCall: async (sessionId?: string, assistantId?: string) => {
    const { vapi, isCallActive } = get();
    if (!vapi || isCallActive) return;
    
    set({ isConnecting: true });
    
    try {
      // Store session info for backend proxy to use
      if (sessionId) localStorage.setItem('activeSessionId', sessionId);
      if (assistantId) localStorage.setItem('activeAssistantId', assistantId);
      
      const token = localStorage.getItem('userToken') || localStorage.getItem('token');
      
      // Determine the proxy URL to use
      let proxyUrl = vapiConfig.proxyUrl;
      
      // If we're using the AI Agent Hub directly (without custom handler)
      const useDirectAgentHub = import.meta.env.VITE_USE_DIRECT_AGENT_HUB === 'true';
      if (useDirectAgentHub) {
        proxyUrl = `${vapiConfig.aiAgentHubUrl}/execute`;
      }
      
      // Check if URL is localhost and provide guidance
      if (proxyUrl.includes('localhost') || proxyUrl.includes('127.0.0.1')) {
        console.warn('⚠️ LOCALHOST URL DETECTED!');
        console.warn('VAPI cannot reach localhost. You need to:');
        console.warn('1. Run the custom LLM handler: node vapi-custom-llm-handler.js');
        console.warn('2. Expose it with ngrok: ngrok http 3001');
        console.warn('3. Update VITE_VAPI_PROXY_URL in .env with the ngrok URL');
        console.warn('');
        console.warn('OR use the AI Agent Hub directly:');
        console.warn('Set VITE_USE_DIRECT_AGENT_HUB=true in .env');
        
        // Try to use AI Agent Hub as fallback
        proxyUrl = `${vapiConfig.aiAgentHubUrl}/execute`;
        console.log('📍 Falling back to AI Agent Hub:', proxyUrl);
      }
      
      console.log('🚀 Starting VAPI with OpenAI and AI Agent Hub tools');
      console.log('📝 Session:', sessionId, 'Assistant:', assistantId);
      
      // Simple inline configuration without tools (tools must be configured via VAPI dashboard)
      const assistantConfig = {
        // Name and description
        name: 'AI Agent Hub Assistant',
        
        // Use standard OpenAI model
        model: {
          provider: 'openai',
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: `You are a helpful AI assistant. When users ask for complex tasks,
                       help them by using available functions to execute tasks through the AI Agent Hub.
                       Be conversational and natural in voice interactions.`
            }
          ],
          temperature: 0.7,
          maxTokens: 500,
          // Define functions that the model can call
          functions: [
            {
              name: 'execute_agent_task',
              description: 'Execute complex tasks using the AI Agent Hub for code analysis, data processing, or multi-step workflows',
              parameters: {
                type: 'object',
                properties: {
                  task: {
                    type: 'string',
                    description: 'The task or query to execute through the AI agent'
                  },
                  context: {
                    type: 'object',
                    description: 'Optional context information',
                    properties: {
                      sessionId: { type: 'string' },
                      assistantId: { type: 'string' }
                    }
                  }
                },
                required: ['task']
              }
            }
          ]
        },
        
        // Voice configuration
        voice: {
          provider: '11labs',
          voiceId: 'EXAVITQu4vr4xnSDxMaL',
          stability: 0.5,
          similarityBoost: 0.75
        },
        
        // Transcriber configuration
        transcriber: { 
          provider: 'deepgram', 
          model: 'nova-2', 
          language: 'en' 
        },
        
        // Server URL for handling function calls
        serverUrl: `${vapiConfig.aiAgentHubUrl}/vapi-webhook`,
        
        // Assistant behavior
        firstMessage: vapiConfig.assistant.firstMessage,
        silenceTimeoutSeconds: 30,
        responseDelaySeconds: 0.4,
        interruptionsEnabled: true,
        backchannelingEnabled: false
      };
      
      console.log('📋 Assistant config with tools:', JSON.stringify(assistantConfig, null, 2));
      
      // Start the call with the enhanced configuration
      await vapi.start(assistantConfig as any);
      
      console.log('✅ VAPI call started with OpenAI model');
      console.log('🛠️ Tool enabled: execute_agent_task');
      console.log('🪝 Webhook URL:', `${vapiConfig.aiAgentHubUrl}/vapi-webhook`);
      console.log('🔐 Auth token:', token ? 'Present' : 'Missing');
    } catch (error) {
      console.error('Failed to start VAPI call:', error);
      set({ isConnecting: false });
    }
  },
  
  endCall: () => {
    const { vapi, isCallActive } = get();
    if (!vapi || !isCallActive) return;
    
    try {
      vapi.stop();
      console.log('📵 Ending VAPI call');
    } catch (error) {
      console.error('Failed to end VAPI call:', error);
    }
  },
  
  toggleMute: () => {
    const { vapi, isMuted } = get();
    if (!vapi) return;
    
    const newMutedState = !isMuted;
    vapi.setMuted(newMutedState);
    set({ isMuted: newMutedState });
    console.log(`Microphone ${newMutedState ? 'muted' : 'unmuted'}`);
  },
  
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
      currentTranscript: '',
      messages: []
    });
  }
}));

export default useVapiStore;