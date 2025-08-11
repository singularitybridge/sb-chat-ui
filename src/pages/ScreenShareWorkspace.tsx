import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Monitor, StopCircle, Maximize2, Minimize2, X, CircleFadingPlus } from 'lucide-react';
import { useScreenShareStore } from '../store/useScreenShareStore';
import { useChatStore } from '../store/chatStore';
import { useSessionStore } from '../store/useSessionStore';
import { useRootStore } from '../store/common/RootStoreContext';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { SBChatKitUI } from '../components/sb-chat-kit-ui/SBChatKitUI';
import MDXRenderer from '../components/sb-core-ui-kit/MDXRenderer';
import { cn } from '../utils/cn';
import { useAudioStore } from '../store/useAudioStore';
import DynamicBackground, { setDynamicBackground } from '../components/DynamicBackground';

const ScreenShareWorkspace: React.FC = observer(() => {
  const { workspace } = useParams<{ workspace: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const rootStore = useRootStore();
  
  // Background configuration - same as Admin pages
  const backgroundProps = setDynamicBackground(
    'https://cdn.midjourney.com/41d91483-76a4-41f1-add2-638ff6f552e8/0_0.png',
    [
      { color: 'rgba(255, 255, 255, 0.95)', position: '0%' },
      { color: 'rgba(255, 255, 255, 0.8)', position: '8%' },
      { color: 'rgba(255, 255, 255, 0)', position: '100%' },
    ],
    [
      { color: '#CACACA', stop: '0%', opacity: 0.5 },
      { color: '#878787', stop: '50%', opacity: 0.6 },
      { color: '#202022', stop: '100%', opacity: 0.7 },
    ],
    'multiply'
  );
  
  // Store hooks
  const {
    isActive: isScreenSharing,
    stream,
    startSession,
    stopSession,
    captureScreenshot,
    sessionId: screenShareSessionId
  } = useScreenShareStore();
  
  const { 
    messages, 
    handleSubmitMessage, 
    isLoading: isStreaming, 
    handleClearChat,
    loadMessages 
  } = useChatStore();
  
  const { 
    activeSession, 
    clearAndRenewActiveSession 
  } = useSessionStore();
  
  const {
    audioState,
    toggleAudio: handleToggleAudio
  } = useAudioStore();
  
  // Get current assistant from session
  const currentAssistant = activeSession?.assistantId 
    ? rootStore.getAssistantById(activeSession.assistantId)
    : null;
  
  // Local state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [agentContent, setAgentContent] = useState<string>('');
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  
  // Load messages on mount
  useEffect(() => {
    if (activeSession?._id) {
      loadMessages(activeSession._id);
    }
  }, [activeSession?._id, loadMessages]);
  
  // Start screen sharing on mount
  useEffect(() => {
    // Only start if not already sharing
    if (!isScreenSharing) {
      startScreenShare();
    }
    
    return () => {
      // Cleanup on unmount
      if (isScreenSharing) {
        stopSession();
      }
    };
  }, []); // Empty dependency array - only run on mount/unmount
  
  // Set up video stream
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  
  // Generate mock MDX content based on workspace
  useEffect(() => {
    const mockMDX = `
# ${workspace === 'home' ? '🏠 Home Workspace' : `📁 ${workspace}`}

## Session Overview
**Active Assistant**: ${currentAssistant?.name || 'No assistant selected'}  
**Session ID**: \`${activeSession?._id?.slice(-8) || 'No session'}\`  
**Screen Status**: ${isScreenSharing ? '🟢 Recording' : '⚪ Inactive'}

## Features
### 📸 Screen Capture
Screenshots are automatically attached when you send a message while screen sharing is active.

### 💬 Conversation
Continue your conversation with ${currentAssistant?.name || 'the assistant'}. All messages are preserved.

### 🔄 Session Management
Use the clear button to start fresh while maintaining your workspace.

## Assistant Info
${currentAssistant?.description || 'Select an assistant to begin.'}

### Statistics
- **Messages**: ${messages.length} total
- **Session Started**: ${activeSession ? new Date(activeSession.createdAt).toLocaleString() : 'Not started'}
- **Screen Captures**: ${isScreenSharing ? 'Enabled' : 'Disabled'}

---
*Powered by Screen Share AI Workspace*
    `;
    setAgentContent(mockMDX);
  }, [workspace, currentAssistant, activeSession, isScreenSharing, messages.length]);

  const startScreenShare = async () => {
    // Prevent multiple simultaneous calls
    if (isScreenSharing || stream) {
      console.log('Screen sharing already active, skipping...');
      return;
    }
    
    try {
      await startSession({
        captureMode: 'manual',
        analysisMode: 'session'
      });
    } catch (error) {
      console.error('Failed to start screen share:', error);
    }
  };

  const handleSendMessage = async (messageText: string, fileMetadata?: any) => {
    // Capture and attach screenshot if screen sharing
    if (isScreenSharing) {
      const screenshot = await captureScreenshot();
      if (screenshot) {
        const fileName = screenShareSessionId 
          ? `${screenShareSessionId}-screenshare.png`
          : `screen-${Date.now()}.png`;
        
        // Create file metadata for the screenshot
        const screenshotMetadata = {
          type: 'image',
          url: URL.createObjectURL(screenshot),
          fileName: fileName,
          fileSize: screenshot.size,
          mimeType: 'image/png'
        };
        
        // Send message with screenshot
        const assistantInfo = currentAssistant ? { 
          _id: currentAssistant._id, 
          voice: currentAssistant.voice, 
          name: currentAssistant.name 
        } : undefined;
        
        await handleSubmitMessage(
          messageText,
          assistantInfo,
          activeSession?._id,
          screenshotMetadata
        );
      }
    } else {
      // Send without screenshot
      const assistantInfo = currentAssistant ? { 
        _id: currentAssistant._id, 
        voice: currentAssistant.voice, 
        name: currentAssistant.name 
      } : undefined;
      
      await handleSubmitMessage(
        messageText,
        assistantInfo,
        activeSession?._id,
        fileMetadata
      );
    }
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      workspaceRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  const handleStopSharing = () => {
    stopSession();
    // Don't navigate away, just stop the screen sharing
  };

  const handleExit = () => {
    // Stop session if still active
    if (isScreenSharing) {
      stopSession();
    }
    navigate(-1); // Go back to previous page
  };

  const handleClear = async () => {
    if (activeSession?._id && currentAssistant?._id) {
      await handleClearChat(
        activeSession._id,
        currentAssistant._id,
        clearAndRenewActiveSession
      );
    }
  };
  
  return (
    <div 
      ref={workspaceRef}
      className="h-screen w-full overflow-hidden flex flex-col relative"
    >
      <DynamicBackground {...backgroundProps} />
      <div className="relative z-10 flex flex-col h-full">
        {/* Header Bar - Floating */}
        <div className="h-16 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {isScreenSharing && (
              <div className="animate-pulse h-2 w-2 bg-red-500 rounded-full"></div>
            )}
            <span className="text-lg font-semibold text-gray-700">
              Screen Share Workspace
            </span>
          </div>
          {currentAssistant && (
            <span className="text-sm text-gray-600">
              with {currentAssistant.name}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5 text-gray-600" /> : <Maximize2 className="h-5 w-5 text-gray-600" />}
          </button>
          
          {isScreenSharing && (
            <button
              onClick={handleStopSharing}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <StopCircle className="h-4 w-4 inline mr-2" />
              Stop Sharing
            </button>
          )}
          
          <button
            onClick={handleExit}
            className="px-4 py-2 bg-gray-200/80 hover:bg-gray-300/80 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            title="Exit workspace"
          >
            <X className="h-4 w-4 inline mr-2" />
            Exit
          </button>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex gap-4 p-4 min-h-0">
        {/* Left Panel - Screen Preview */}
        <div className="w-[380px] flex flex-col rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <div className="px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center">
              <Monitor className="h-4 w-4 mr-2" />
              Screen Preview
            </h3>
          </div>
          <div className="flex-1 bg-gray-900 p-4 flex items-center justify-center">
            {isScreenSharing && stream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <div className="text-center">
                <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-300 mb-1">
                  {isScreenSharing ? 'Connecting...' : 'Screen sharing is off'}
                </p>
                {!isScreenSharing && (
                  <button
                    onClick={startScreenShare}
                    className="mt-4 px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg"
                  >
                    Start Screen Share
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100">
            <p className="text-xs text-gray-600 flex items-center">
              {isScreenSharing ? (
                <>
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                  Live • Screenshots attached to messages
                </>
              ) : (
                <>
                  <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                  Inactive • Click to start sharing
                </>
              )}
            </p>
          </div>
        </div>
        
        {/* Center Panel - Chat */}
        <div className="flex-1 flex flex-col rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg overflow-hidden min-w-0">
          <SBChatKitUI
            messages={messages}
            assistant={currentAssistant ? {
              name: currentAssistant.name,
              description: currentAssistant.description,
              avatar: currentAssistant.avatarImage,
              conversationStarters: currentAssistant.conversationStarters?.length
                ? currentAssistant.conversationStarters.map(cs => ({ ...cs }))
                : []
            } : undefined}
            assistantName={currentAssistant?.name || "AI Assistant"}
            onSendMessage={handleSendMessage}
            onClear={handleClear}
            onToggleAudio={handleToggleAudio}
            audioState={audioState}
            isLoading={isStreaming}
          />
        </div>
        
        {/* Right Panel - Workspace Content */}
        <div className="w-[380px] flex flex-col rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <div className="px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-700">
              Workspace: {workspace}
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-6 bg-white">
            <div className="prose prose-sm max-w-none">
              {agentContent ? (
                <MDXRenderer content={agentContent} />
              ) : (
                <div className="text-center text-gray-400 mt-8">
                  <p className="text-sm">Loading workspace content...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
});

export default ScreenShareWorkspace;