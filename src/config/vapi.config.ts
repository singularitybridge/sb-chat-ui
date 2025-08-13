export const vapiConfig = {
  publicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY || '',
  assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID || '',
  
  // Assistant configuration for client-side mode with function calling
  assistant: {
    model: {
      provider: 'openai' as const,
      model: 'gpt-4.1-mini' as const,
      temperature: 0.7,
      messages: [
        {
          role: 'system' as const,
          content: `You are a voice interface assistant. 
          Your primary job is to listen to users and speak responses provided to you.
          Keep responses natural and conversational.
          When you receive a system message with a response to speak, say it exactly as provided.`
        }
      ]
    },
    voice: {
      provider: '11labs' as const,
      voiceId: 'EXAVITQu4vr4xnSDxMaL', // Sarah - Natural female voice
      stability: 0.5,
      similarityBoost: 0.75,
    },
    firstMessage: 'Hello! I can see your screen and I\'m ready to help. What would you like to know?',
    endCallMessage: 'Thank you for using voice chat. Goodbye!',
    
    // Silence settings
    silenceTimeoutSeconds: 30,
    responseDelaySeconds: 0.4,
    
    // Advanced settings
    interruptionsEnabled: true,
    backchannelingEnabled: true,
    
    // Server URL for function calls (we'll handle this client-side)
    serverUrl: undefined,
    
    // Client messages to receive
    clientMessages: [
      'transcript' as const,
      'hang' as const,
      'function-call' as const,
      'function-call-result' as const,
      'speech-update' as const,
      'metadata' as const,
      'conversation-update' as const,
    ] as const,
  },
  
  // Voice activity detection settings
  vadSettings: {
    threshold: 0.5,
    silenceDuration: 500,
  },
  
  // Audio settings
  audioSettings: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
};

export default vapiConfig;