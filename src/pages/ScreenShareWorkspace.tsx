import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Monitor, StopCircle, Maximize2, Minimize2, X, Sparkles, Phone, PhoneOff, Laptop, Bot } from 'lucide-react';
import { useScreenShareStore } from '../store/useScreenShareStore';
import { useChatStore } from '../store/chatStore';
import { useSessionStore } from '../store/useSessionStore';
import { useRootStore } from '../store/common/RootStoreContext';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { SBChatKitUI } from '../components/sb-chat-kit-ui/SBChatKitUI';
import LiveCodeRenderer from '../components/sb-core-ui-kit/LiveCodeRenderer';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import Badge from '../components/Badge';
import { CheckSquare, Users, Target, Brain, TrendingUp, Calendar } from 'lucide-react';
import { cn } from '../utils/cn';
import DynamicBackground, { setDynamicBackground } from '../components/DynamicBackground';
import { fileToBase64Attachment, Base64Attachment } from '../utils/base64Utils';
import { uploadContentFile } from '../services/api/contentFileService';
import { useUploadPreferencesStore } from '../store/useUploadPreferencesStore';
import VoiceChat from '../components/VoiceChat/VoiceChat';
import useVapiStore from '../store/useVapiStore';
import { ToggleSwitch } from '../components/ui/toggle-switch';

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
  
  const { saveToCloud } = useUploadPreferencesStore();
  
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
  
  // Audio store not needed after removing audio toggle from UI
  // const { audioState, toggleAudio: handleToggleAudio } = useAudioStore();
  
  const { isCallActive: isVoiceActive } = useVapiStore();
  
  // Get current assistant from session
  const currentAssistant = activeSession?.assistantId 
    ? rootStore.getAssistantById(activeSession.assistantId)
    : null;
  
  // Local state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [agentContent, setAgentContent] = useState<string>('');
  const [showVoiceChat, setShowVoiceChat] = useState(false);
  const [showAIWorkspace, setShowAIWorkspace] = useState(false); // false = User Screen, true = AI Workspace
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  
  // Load messages on mount and ensure we have a session
  useEffect(() => {
    if (activeSession?._id) {
      loadMessages(activeSession._id);
    } else {
      // If no active session, we need to select an assistant first
      console.log('No active session in workspace. Please select an assistant first.');
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
  
  // Generate AI insights placeholder content using React components
  useEffect(() => {
    // React JSX code as string that will be compiled by LiveCodeRenderer
    const reactCode = `
<>
  <div className="min-h-full bg-gradient-to-br from-gray-50 via-white to-blue-50 p-8 flex flex-col items-center justify-center">
    
    {/* Central Icon and Title */}
    <div className="mb-8 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-2xl">
        <Brain className="h-10 w-10 text-white" />
      </div>
      <h1 className="text-3xl font-light text-gray-800 mb-3">AI Workspace</h1>
      <p className="text-gray-600 max-w-md mx-auto">
        Your AI assistant will display insights, action items, and analysis here
      </p>
    </div>

    {/* Status Indicator */}
    <div className="flex items-center gap-3 mb-8 px-6 py-3 bg-white rounded-full shadow-lg">
      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
      <span className="text-sm font-medium text-gray-700">
        ${isScreenSharing ? 'Analyzing your screen' : 'Ready to analyze'}
      </span>
    </div>

    {/* Coming Soon Features */}
    <Card className="max-w-lg border-0 shadow-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          What's Coming
        </h3>
        <div className="space-y-2 text-sm opacity-95">
          <p>📋 Smart action items from your conversations</p>
          <p>🎯 Real-time insights and recommendations</p>
          <p>📊 Interactive dashboards and visualizations</p>
        </div>
      </CardContent>
    </Card>

    {/* Footer */}
    <div className="mt-8 text-center">
      <p className="text-xs text-gray-500">
        ${messages.length} messages analyzed • ${currentAssistant?.name || 'No assistant selected'}
      </p>
    </div>
  </div>
</>
    `;
    
    setAgentContent(reactCode);
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

  const handleSendMessage = async (messageText: string, attachments?: Base64Attachment[]) => {
    console.log('🚀 [ScreenShareWorkspace] handleSendMessage called', {
      messageText,
      hasAttachments: !!attachments,
      activeSessionId: activeSession?._id,
      currentAssistantId: currentAssistant?._id,
      isScreenSharing
    });
    
    // Check if we have an active session
    if (!activeSession?._id) {
      console.error('No active session. Please select an assistant from the assistants page first.');
      return;
    }
    
    // Capture and attach screenshot if screen sharing
    if (isScreenSharing) {
      console.log('📸 [ScreenShareWorkspace] Capturing screenshot...');
      const screenshot = await captureScreenshot();
      if (screenshot) {
        const fileName = screenShareSessionId 
          ? `${screenShareSessionId}-screenshare.png`
          : `screen-${Date.now()}-screenshare.png`;
        
        console.log('📤 [ScreenShareWorkspace] Uploading screenshot:', fileName);
        
        try {
          // Convert screenshot to base64 attachment
          const file = new File([screenshot], fileName, { type: 'image/png' });
          const screenshotAttachment = await fileToBase64Attachment(file);
          
          // If saveToCloud is enabled, also upload to cloud storage
          if (saveToCloud) {
            try {
              const formData = new FormData();
              formData.append('file', file);
              formData.append('title', fileName);
              
              const uploadResponse = await uploadContentFile(formData);
              
              if (uploadResponse?.data?.gcpStorageUrl) {
                screenshotAttachment.cloudUrl = uploadResponse.data.gcpStorageUrl;
                console.log('📤 Screenshot uploaded to cloud:', uploadResponse.data.gcpStorageUrl);
              }
            } catch (uploadError) {
              console.error('Cloud upload failed (continuing with base64):', uploadError);
            }
          }
          
          console.log('📎 [ScreenShareWorkspace] Created attachment:', {
            fileName: screenshotAttachment.fileName,
            mimeType: screenshotAttachment.mimeType,
            hasCloudUrl: !!screenshotAttachment.cloudUrl
          });
            
            // Send message with screenshot
            const assistantInfo = currentAssistant ? { 
              _id: currentAssistant._id, 
              voice: currentAssistant.voice, 
              name: currentAssistant.name 
            } : undefined;
            
            console.log('💬 [ScreenShareWorkspace] Calling handleSubmitMessage with:', {
              messageText,
              assistantInfo,
              sessionId: activeSession?._id,
              attachmentCount: 1
            });
            
            await handleSubmitMessage(
              messageText,
              assistantInfo,
              activeSession?._id,
              [screenshotAttachment]
            );
            
            console.log('✅ [ScreenShareWorkspace] Message sent successfully');
        } catch (error) {
          console.error('Failed to process screenshot:', error);
          // Send message without screenshot on error
          const assistantInfo = currentAssistant ? { 
            _id: currentAssistant._id, 
            voice: currentAssistant.voice, 
            name: currentAssistant.name 
          } : undefined;
          
          await handleSubmitMessage(
            messageText,
            assistantInfo,
            activeSession?._id,
            undefined
          );
        }
      }
    } else {
      // Send without screenshot
      console.log('📨 [ScreenShareWorkspace] Sending message without screenshot');
      
      const assistantInfo = currentAssistant ? { 
        _id: currentAssistant._id, 
        voice: currentAssistant.voice, 
        name: currentAssistant.name 
      } : undefined;
      
      console.log('💬 [ScreenShareWorkspace] Calling handleSubmitMessage (no screenshot) with:', {
        messageText,
        assistantInfo,
        sessionId: activeSession?._id,
        attachments
      });
      
      await handleSubmitMessage(
        messageText,
        assistantInfo,
        activeSession?._id,
        attachments
      );
      
      console.log('✅ [ScreenShareWorkspace] Message sent successfully (no screenshot)');
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
          {/* Voice Mode Toggle */}
          <button
            onClick={() => setShowVoiceChat(!showVoiceChat)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center gap-2",
              showVoiceChat 
                ? "bg-green-500 hover:bg-green-600 text-white" 
                : "bg-gray-200/80 hover:bg-gray-300/80 text-gray-700"
            )}
            title={showVoiceChat ? 'Hide voice chat' : 'Show voice chat'}
          >
            {isVoiceActive ? (
              <>
                <PhoneOff className="h-4 w-4" />
                Voice Active
              </>
            ) : (
              <>
                <Phone className="h-4 w-4" />
                Voice Mode
              </>
            )}
          </button>
          
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
      
      {/* Voice Chat Overlay */}
      {showVoiceChat && (
        <div className="absolute top-20 right-4 z-20 w-96">
          <VoiceChat className="animate-in fade-in slide-in-from-top-2 duration-300" />
        </div>
      )}
      
      {/* Main Content Area */}
      <div className="flex-1 flex gap-4 p-4 min-h-0">
        {/* Left Panel - Chat (1/3) */}
        <div className="flex-1 flex flex-col rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg overflow-hidden">
          {!activeSession ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Active Session</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Please select an assistant from the assistants page first.
                </p>
                <button
                  onClick={() => navigate('/admin/assistants')}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  Go to Assistants
                </button>
              </div>
            </div>
          ) : (
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
              assistantName={currentAssistant?.name || 'AI Assistant'}
              onSendMessage={handleSendMessage}
              onClear={handleClear}
              isLoading={isStreaming}
            />
          )}
        </div>
        
        {/* Middle & Right Panel - Combined View Area (2/3) */}
        <div className="flex-[2] flex flex-col rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center">
              {showAIWorkspace ? (
                <>
                  <Bot className="h-4 w-4 mr-2" />
                  AI Workspace: {workspace}
                </>
              ) : (
                <>
                  <Monitor className="h-4 w-4 mr-2" />
                  Screen Preview
                </>
              )}
            </h3>
            <ToggleSwitch
              checked={showAIWorkspace}
              onChange={setShowAIWorkspace}
              leftIcon={<Laptop className="h-4 w-4" />}
              rightIcon={<Bot className="h-4 w-4" />}
              leftLabel="User Screen"
              rightLabel="AI Workspace"
            />
          </div>
          {/* Dynamic Content Area - Shows either Screen Preview or AI Workspace */}
          {showAIWorkspace ? (
            // AI Workspace View
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              {agentContent ? (
                <LiveCodeRenderer 
                  code={agentContent}
                  scope={{
                    Card,
                    CardHeader,
                    CardTitle,
                    CardContent,
                    Badge,
                    CheckSquare,
                    Users,
                    Target,
                    Brain,
                    TrendingUp,
                    Calendar,
                    Sparkles,
                    cn,
                    messages,
                    isScreenSharing,
                    currentAssistant
                  }}
                  className="w-full"
                  showErrorsInline
                />
              ) : (
                <div className="text-center text-gray-400 mt-8">
                  <p className="text-sm">Loading workspace content...</p>
                </div>
              )}
            </div>
          ) : (
            // User Screen Preview
            <>
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
            </>
          )}
        </div>
      </div>
      </div>
    </div>
  );
});

export default ScreenShareWorkspace;
