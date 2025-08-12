export const vapiConfig = {
  publicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY || '',
  assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID || '',
  
  // Assistant configuration for client-side mode
  assistant: {
    model: {
      provider: 'openai' as const,
      model: 'gpt-4-turbo' as const,
      temperature: 0.7,
      messages: [
        {
          role: 'system' as const,
          content: `You are a helpful AI assistant integrated with the screen sharing workspace. 
          Keep your spoken responses concise (1-2 sentences) for voice interactions.
          When asked complex questions, provide brief verbal summaries.`
        }
      ]
    },
    voice: {
      provider: '11labs' as const,
      voiceId: 'EXAVITQu4vr4xnSDxMaL', // Sarah - Natural female voice
      stability: 0.5,
      similarityBoost: 0.75,
    },
    firstMessage: 'Hello! I can see your screen. How can I help you today?',
    endCallMessage: 'Thank you for using voice chat. Goodbye!',
    
    // Silence settings
    silenceTimeoutSeconds: 30,
    responseDelaySeconds: 0.4,
    
    // Advanced settings
    interruptionsEnabled: true,
    backchannelingEnabled: true,
    
    // Client messages to receive
    clientMessages: [
      'transcript' as const,
      'hang' as const,
      'function-call' as const,
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