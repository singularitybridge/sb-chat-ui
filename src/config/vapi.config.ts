export const vapiConfig = {
  publicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY || '',
  
  // Optional: Use a pre-configured assistant from VAPI dashboard
  assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID || '',
  
  // AI Agent Hub URL (ngrok or public URL required for VAPI)
  aiAgentHubUrl: import.meta.env.VITE_AI_AGENT_HUB_URL || 'https://f69b9975260b.ngrok-free.app',
  
  // Proxy URL for custom LLM handler (must be ngrok or public URL)
  proxyUrl: import.meta.env.VITE_VAPI_PROXY_URL || 'http://localhost:3001/chat/completions',
  
  // Webhook secret for server-side function calls
  webhookSecret: import.meta.env.VITE_VAPI_WEBHOOK_SECRET || '',
  
  // Default assistant configuration
  assistant: {
    voice: {
      provider: '11labs' as const,
      voiceId: 'EXAVITQu4vr4xnSDxMaL', // Sarah - Natural female voice
      stability: 0.5,
      similarityBoost: 0.75,
    },
    firstMessage: 'Hello! I can help you with complex tasks using our AI Agent Hub. What would you like to work on?',
    
    // Timeout settings
    silenceTimeoutSeconds: 30,
    responseDelaySeconds: 0.4,
    
    // Enable interruptions for natural conversation
    interruptionsEnabled: true,
    backchannelingEnabled: false,
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