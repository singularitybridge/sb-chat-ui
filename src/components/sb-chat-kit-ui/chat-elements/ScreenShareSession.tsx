import React from 'react';
import { Monitor, StopCircle } from 'lucide-react';
import { useScreenShareStore } from '../../../store/useScreenShareStore';

interface ScreenShareSessionProps {
  onScreenCapture?: (blob: Blob, analysis?: any) => void;
}

export const ScreenShareSession: React.FC<ScreenShareSessionProps> = ({ onScreenCapture }) => {
  const {
    isActive,
    status,
    startSession,
    stopSession
  } = useScreenShareStore();

  const handleStartSession = async () => {
    try {
      await startSession({
        captureMode: 'manual',
        analysisMode: 'stateless'
      });
    } catch (error) {
      console.error('Failed to start screen share:', error);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      {/* Main control button */}
      {!isActive ? (
        <button
          onClick={handleStartSession}
          className="inline-flex items-center justify-center h-7 w-7 text-muted-foreground hover:text-foreground transition-colors"
          title="Start screen sharing"
        >
          <Monitor className="h-5 w-5" />
        </button>
      ) : (
        <button
          onClick={stopSession}
          className="inline-flex items-center justify-center h-7 w-7 text-red-500 hover:text-red-600 animate-pulse transition-colors"
          title="Stop screen sharing"
        >
          <StopCircle className="h-5 w-5" />
        </button>
      )}

    </div>
  );
};