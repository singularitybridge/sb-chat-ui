import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Phone, PhoneOff, Volume2, Loader2 } from 'lucide-react';
import useVapiStore from '../../store/useVapiStore';
import { useSessionStore } from '../../store/useSessionStore';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceChatProps {
  className?: string;
  compact?: boolean;
}

const VoiceChat: React.FC<VoiceChatProps> = ({ className = '', compact = false }) => {
  const {
    vapi,
    isCallActive,
    isConnecting,
    isMuted,
    isSpeaking,
    isListening,
    currentTranscript,
    messages,
    initializeVapi,
    startCall,
    endCall,
    toggleMute
  } = useVapiStore();
  
  const { activeSession } = useSessionStore();
  const [showTranscript, setShowTranscript] = useState(true);
  
  // Initialize VAPI on mount
  useEffect(() => {
    console.log('🎙️ VoiceChat component mounted - initializing VAPI');
    initializeVapi();
    
    return () => {
      // Cleanup on unmount
      console.log('🎙️ VoiceChat component unmounting');
      if (isCallActive) {
        endCall();
      }
    };
  }, []);
  
  const handleStartCall = () => {
    if (activeSession) {
      startCall(activeSession._id, activeSession.assistantId);
    } else {
      startCall();
    }
  };
  
  const getStatusText = () => {
    if (isConnecting) return 'Connecting...';
    if (!isCallActive) return 'Voice Chat Inactive';
    if (isSpeaking) return 'Assistant Speaking...';
    if (isListening) return 'Listening...';
    if (currentTranscript) return 'Processing...';
    return 'Ready';
  };
  
  const getStatusColor = () => {
    if (!isCallActive) return 'bg-gray-500';
    if (currentTranscript) return 'bg-purple-500';
    if (isSpeaking) return 'bg-blue-500';
    if (isListening) return 'bg-green-500';
    return 'bg-yellow-500';
  };
  
  // Compact mode for integration in other components
  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {!isCallActive ? (
          <button
            onClick={handleStartCall}
            disabled={isConnecting}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isConnecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Phone className="w-4 h-4" />
            )}
            <span>Start Voice</span>
          </button>
        ) : (
          <>
            <button
              onClick={endCall}
              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <PhoneOff className="w-4 h-4" />
            </button>
            <button
              onClick={toggleMute}
              className={`p-2 rounded-lg transition-colors ${
                isMuted 
                  ? 'bg-gray-600 text-white hover:bg-gray-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${isListening ? 'animate-pulse' : ''}`} />
              <span className="text-sm text-gray-600">{getStatusText()}</span>
            </div>
          </>
        )}
      </div>
    );
  }
  
  // Full voice chat interface
  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Voice Assistant</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isCallActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
        }`}>
          {getStatusText()}
        </div>
      </div>
      
      {/* Audio Visualizer */}
      <div className="mb-6">
        <div className="flex items-center justify-center gap-1 h-20">
          {isCallActive && (
            <>
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-1 bg-gradient-to-t ${
                    currentTranscript
                      ? 'from-purple-400 to-purple-600'
                      : isSpeaking 
                      ? 'from-blue-400 to-blue-600' 
                      : isListening 
                      ? 'from-green-400 to-green-600'
                      : 'from-gray-300 to-gray-400'
                  } rounded-full`}
                  animate={{
                    height: isCallActive 
                      ? [10, Math.random() * 60 + 20, 10]
                      : 10
                  }}
                  transition={{
                    duration: currentTranscript ? 0.3 : 0.5,
                    repeat: Infinity,
                    delay: i * 0.05
                  }}
                />
              ))}
            </>
          )}
          {!isCallActive && (
            <div className="text-gray-400">
              <Volume2 className="w-12 h-12" />
            </div>
          )}
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex justify-center gap-4 mb-6">
        {!isCallActive ? (
          <button
            onClick={handleStartCall}
            disabled={isConnecting || !vapi}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isConnecting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Phone className="w-5 h-5" />
            )}
            <span className="font-medium">
              {isConnecting ? 'Connecting...' : 'Start Voice Chat'}
            </span>
          </button>
        ) : (
          <>
            <button
              onClick={endCall}
              className="p-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
            <button
              onClick={toggleMute}
              className={`p-3 rounded-xl transition-all shadow-lg ${
                isMuted 
                  ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700' 
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </>
        )}
      </div>
      
      {/* Current Transcript */}
      <AnimatePresence>
        {currentTranscript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <p className="text-sm font-medium text-green-800 mb-1">You're saying:</p>
            <p className="text-gray-700">{currentTranscript}</p>
            <div className="flex items-center gap-2 mt-2">
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              <span className="text-sm text-purple-600">Processing with AI agent...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      
      {/* Message History */}
      {messages.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-600">Conversation History</h4>
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              {showTranscript ? 'Hide' : 'Show'} Details
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {messages.slice(-5).map((message, index) => (
              <div
                key={index}
                className={`text-sm p-2 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-green-50 text-green-800 ml-8' 
                    : message.type === 'assistant'
                    ? 'bg-blue-50 text-blue-800 mr-8'
                    : 'bg-gray-50 text-gray-600'
                }`}
              >
                <span className="font-medium">
                  {message.type === 'user' ? 'You: ' : message.type === 'assistant' ? 'Assistant: ' : 'System: '}
                </span>
                {message.content}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Setup Instructions */}
      {!vapi && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Setup Required:</strong> Please add your VAPI credentials to the .env file:
          </p>
          <code className="block mt-2 text-xs bg-yellow-100 p-2 rounded">
            VITE_VAPI_PUBLIC_KEY=your-key-here
          </code>
          <p className="text-xs text-yellow-700 mt-2">
            Note: Without VITE_VAPI_ASSISTANT_ID, VAPI will use custom LLM routing to your backend.
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceChat;