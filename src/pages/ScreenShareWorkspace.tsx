import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Monitor, StopCircle, Maximize2, Minimize2, X, CircleFadingPlus, Phone, PhoneOff } from 'lucide-react';
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
import { useAudioStore } from '../store/useAudioStore';
import DynamicBackground, { setDynamicBackground } from '../components/DynamicBackground';
import { createFileMetadata } from '../utils/fileUtils';
import VoiceChat from '../components/VoiceChat/VoiceChat';
import useVapiStore from '../store/useVapiStore';

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
  
  const { isCallActive: isVoiceActive } = useVapiStore();
  
  // Get current assistant from session
  const currentAssistant = activeSession?.assistantId 
    ? rootStore.getAssistantById(activeSession.assistantId)
    : null;
  
  // Local state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [agentContent, setAgentContent] = useState<string>('');
  const [showVoiceChat, setShowVoiceChat] = useState(false);
  
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
  
  // Generate visionary daily planner content using React components
  useEffect(() => {
    const now = new Date();
    const timeOfDay = now.getHours() < 12 ? 'Morning' : now.getHours() < 17 ? 'Afternoon' : 'Evening';
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    
    // React JSX code as string that will be compiled by LiveCodeRenderer
    const reactCode = `
<>
  {/* Header */}
  <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white p-8 rounded-xl mb-6 shadow-xl">
    <h1 className="text-4xl font-light mb-2">Good ${timeOfDay}, Visionary</h1>
    <p className="opacity-90 text-lg">${dayName}, ${dateStr}</p>
  </div>

  {/* Today's North Star */}
  <Card className="mb-6 shadow-lg">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Target className="h-5 w-5 text-yellow-500" />
        Today's North Star
      </CardTitle>
    </CardHeader>
    <CardContent>
      <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-gray-600">
        "The future belongs to those who believe in the beauty of their dreams."
        <footer className="text-sm text-gray-500 mt-2">— Eleanor Roosevelt</footer>
      </blockquote>
    </CardContent>
  </Card>

  {/* Strategic Focus Areas */}
  <div className="space-y-4 mb-6">
    <h2 className="text-2xl font-semibold flex items-center gap-2 mb-4">
      <Brain className="h-6 w-6 text-purple-500" />
      Strategic Focus Areas
    </h2>
    
    {/* Deep Work Block */}
    <Card className="border-l-4 border-blue-500">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          🚀 Deep Work Block (9:00 - 12:00)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-semibold mb-2">Priority Initiative: Product Vision 2025</p>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span>Review quarterly OKRs alignment</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span>Strategic partnership proposal review</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span>Innovation pipeline assessment</span>
          </label>
        </div>
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">💡 Insight: Your most creative hours. Guard this time zealously.</p>
        </div>
      </CardContent>
    </Card>
    
    {/* Collaboration Window */}
    <Card className="border-l-4 border-green-500">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-green-600" />
          Collaboration Window (1:00 - 3:00)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-semibold mb-2">Key Stakeholder Touchpoints</p>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span>Executive sync with leadership team</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span>Mentor session with emerging leaders</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span>Cross-functional innovation workshop</span>
          </label>
        </div>
        <div className="mt-3 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-700">🌟 Remember: Great leaders create more leaders, not followers.</p>
        </div>
      </CardContent>
    </Card>
    
    {/* Reflection & Strategy */}
    <Card className="border-l-4 border-yellow-500">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          🧘 Reflection & Strategy (4:00 - 5:00)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-semibold mb-2">Strategic Thinking Time</p>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span>Market trends analysis</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span>Competitive landscape review</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span>Tomorrow's priorities setting</span>
          </label>
        </div>
        <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-700">🔮 Vision: Where do we want to be in 5 years?</p>
        </div>
      </CardContent>
    </Card>
  </div>

  {/* High-Impact Decisions */}
  <Card className="mb-6">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        💎 High-Impact Decisions Queue
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Priority</th>
              <th className="text-left py-2">Decision</th>
              <th className="text-left py-2">Impact</th>
              <th className="text-left py-2">Deadline</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2"><Badge className="bg-red-500 text-white">High</Badge></td>
              <td className="py-2">Product roadmap Q2</td>
              <td className="py-2">Company-wide</td>
              <td className="py-2">Today</td>
            </tr>
            <tr className="border-b">
              <td className="py-2"><Badge className="bg-yellow-500 text-white">Medium</Badge></td>
              <td className="py-2">Team expansion strategy</td>
              <td className="py-2">Department</td>
              <td className="py-2">This week</td>
            </tr>
            <tr>
              <td className="py-2"><Badge className="bg-green-500 text-white">Low</Badge></td>
              <td className="py-2">Office redesign proposal</td>
              <td className="py-2">Culture</td>
              <td className="py-2">This month</td>
            </tr>
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>

  {/* Performance Metrics */}
  <div className="grid grid-cols-3 gap-4 mb-6">
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-xl text-center">
      <div className="text-3xl font-bold">${messages.length}</div>
      <div className="opacity-90 mt-1">Insights Shared</div>
    </div>
    <div className="bg-gradient-to-br from-pink-500 to-red-500 text-white p-6 rounded-xl text-center">
      <div className="text-3xl font-bold">87%</div>
      <div className="opacity-90 mt-1">Goals Progress</div>
    </div>
    <div className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white p-6 rounded-xl text-center">
      <div className="text-3xl font-bold">∞</div>
      <div className="opacity-90 mt-1">Potential Unlocked</div>
    </div>
  </div>

  {/* Footer Quote */}
  <Card className="bg-gray-50">
    <CardContent className="py-6">
      <p className="italic text-gray-600 text-center">
        "Leadership is not about being in charge. It's about taking care of those in your charge."
      </p>
      <p className="text-gray-500 text-sm text-center mt-2">— Simon Sinek</p>
    </CardContent>
  </Card>

  {/* Status Footer */}
  <div className="text-center mt-6 pt-6 border-t border-gray-200">
    <p className="text-gray-500 text-sm">
      ${isScreenSharing ? '🔴 Screen Sharing Active' : '⚪ Screen Sharing Inactive'} | 
      Assistant: ${currentAssistant?.name || 'Not Selected'} | 
      Powered by Visionary AI
    </p>
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

  const handleSendMessage = async (messageText: string, fileMetadata?: any) => {
    console.log('🚀 [ScreenShareWorkspace] handleSendMessage called', {
      messageText,
      hasFileMetadata: !!fileMetadata,
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
          // Upload the screenshot to get gcpStorageUrl
          const formData = new FormData();
          const file = new File([screenshot], fileName, { type: 'image/png' });
          formData.append('file', file);
          formData.append('title', fileName); // Add title field
          
          const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL}/content-file/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            },
            body: formData
          });
          
          if (!uploadResponse.ok) {
            throw new Error('Failed to upload screenshot');
          }
          
          const uploadResult = await uploadResponse.json();
          console.log('✅ [ScreenShareWorkspace] Upload successful:', uploadResult);
          
          if (uploadResult.success && uploadResult.data) {
            // Use createFileMetadata utility for consistency
            const screenshotMetadata = createFileMetadata(file, uploadResult);
            console.log('📎 [ScreenShareWorkspace] Created file metadata:', screenshotMetadata);
            
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
              fileMetadata: screenshotMetadata
            });
            
            await handleSubmitMessage(
              messageText,
              assistantInfo,
              activeSession?._id,
              screenshotMetadata
            );
            
            console.log('✅ [ScreenShareWorkspace] Message sent successfully');
          }
        } catch (error) {
          console.error('Failed to upload screenshot:', error);
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
        fileMetadata
      });
      
      await handleSubmitMessage(
        messageText,
        assistantInfo,
        activeSession?._id,
        fileMetadata
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
              onToggleAudio={handleToggleAudio}
              audioState={audioState}
              isLoading={isStreaming}
            />
          )}
        </div>
        
        {/* Middle Panel - Screen Preview (1/3) */}
        <div className="flex-1 flex flex-col rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
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
        
        {/* Right Panel - Agent Workspace (1/3) */}
        <div className="flex-1 flex flex-col rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <div className="px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-700">
              Workspace: {workspace}
            </h3>
          </div>
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
        </div>
      </div>
      </div>
    </div>
  );
});

export default ScreenShareWorkspace;
