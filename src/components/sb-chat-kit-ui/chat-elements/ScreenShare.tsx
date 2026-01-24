import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Monitor, StopCircle, Settings, X } from 'lucide-react';

interface ScreenShareProps {
  onScreenCapture: (file: File, metadata?: any) => void;
}

export const ScreenShare: React.FC<ScreenShareProps> = ({ 
  onScreenCapture
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captureInterval, setCaptureInterval] = useState(5000); // Default 5 seconds
  const [showSettings, setShowSettings] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const [lastCaptureTime, setLastCaptureTime] = useState<Date | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const captureScreenshot = useCallback(async () => {
    console.log('Attempting to capture screenshot...');
    
    if (!videoRef.current || !canvasRef.current || !streamRef.current) {
      console.error('Missing required elements:', {
        video: !!videoRef.current,
        canvas: !!canvasRef.current,
        stream: !!streamRef.current
      });
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Wait for video to be ready (readyState 4 = HAVE_ENOUGH_DATA)
    if (video.readyState < 4) {
      console.log('Video not ready, readyState:', video.readyState, 'waiting...');
      setTimeout(() => captureScreenshot(), 500);
      return;
    }
    
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error('Could not get canvas context');
      return;
    }
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;
    
    console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
    
    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      if (blob) {
        console.log('Screenshot captured, blob size:', blob.size);
        
        // Create a File object from the blob
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const file = new File([blob], `screen-capture-${timestamp}.png`, {
          type: 'image/png',
          lastModified: Date.now()
        });
        
        console.log('Sending screenshot to parent:', file.name);
        
        // Send the screenshot to parent component
        onScreenCapture(file, {
          type: 'screen-capture',
          timestamp: new Date(),
          captureNumber: captureCount + 1
        });
        
        setCaptureCount(prev => prev + 1);
        setLastCaptureTime(new Date());
      } else {
        console.error('Failed to create blob from canvas');
      }
    }, 'image/png', 0.9);
  }, [onScreenCapture, captureCount]);

  const startScreenShare = async () => {
    try {
      console.log('Starting screen share...');
      
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });
      
      console.log('Got media stream:', mediaStream.id);
      
      setStream(mediaStream);
      streamRef.current = mediaStream;
      setIsCapturing(true);
      setCaptureCount(0);
      
      // Set up video element
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video to load and start playing
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded, dimensions:', 
            videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
          
          // Ensure video is playing
          videoRef.current?.play().then(() => {
            console.log('Video playing, waiting for first frame...');
            
            // Wait a bit longer for the first frame to render
            setTimeout(() => {
              console.log('Taking first screenshot...');
              captureScreenshot();
            }, 1000); // Increased delay to ensure frame is rendered
          }).catch(err => {
            console.error('Error playing video:', err);
          });
        };
      }
      
      // Handle stream end (user stops sharing)
      mediaStream.getVideoTracks()[0].addEventListener('ended', () => {
        console.log('Stream ended by user');
        stopScreenShare();
      });
      
      // Start periodic capture
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Set up interval for subsequent captures
      intervalRef.current = setInterval(() => {
        console.log('Taking periodic screenshot...');
        captureScreenshot();
      }, captureInterval);
      
    } catch (err) {
      console.error('Error starting screen share:', err);
      setIsCapturing(false);
    }
  };

  const stopScreenShare = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      streamRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setIsCapturing(false);
    setCaptureCount(0);
    setLastCaptureTime(null);
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleToggle = async () => {
    console.log('Toggle screen share, current state:', isCapturing);
    if (isCapturing) {
      stopScreenShare();
    } else {
      await startScreenShare();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stopScreenShare();
      }
    };
  }, [stream]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString();
  };

  const intervalOptions = [
    { value: 1000, label: '1 second' },
    { value: 3000, label: '3 seconds' },
    { value: 5000, label: '5 seconds' },
    { value: 10000, label: '10 seconds' },
    { value: 30000, label: '30 seconds' },
    { value: 60000, label: '1 minute' }
  ];

  return (
    <div className="relative">
      {/* Main button */}
      <button
        onClick={handleToggle}
        className={`inline-flex items-center justify-center h-7 w-7 relative transition-colors ${
          isCapturing ? 'text-red-500 animate-pulse' : 'text-muted-foreground hover:text-foreground'
        }`}
        title={isCapturing ? 'Stop screen sharing' : 'Start screen sharing'}
      >
        {isCapturing ? (
          <StopCircle className="h-5 w-5" />
        ) : (
          <Monitor className="h-5 w-5" />
        )}
      </button>

      {/* Settings button */}
      {!isCapturing && (
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="absolute -top-8 left-0 p-1 bg-background rounded shadow-sm border border-border text-muted-foreground hover:text-foreground"
          title="Screen share settings"
        >
          <Settings className="h-3 w-3" />
        </button>
      )}

      {/* Settings panel */}
      {showSettings && !isCapturing && (
        <div className="absolute bottom-10 left-0 bg-background rounded-lg shadow-lg border border-border p-3 w-48 z-50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Capture Interval</span>
            <button
              onClick={() => setShowSettings(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <select
            value={captureInterval}
            onChange={(e) => setCaptureInterval(Number(e.target.value))}
            className="w-full text-sm border rounded px-2 py-1"
          >
            {intervalOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Status indicator */}
      {isCapturing && (
        <div className="absolute -top-8 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded animate-pulse">
          Recording • {captureCount} captures
          {lastCaptureTime && (
            <span className="ml-1 opacity-75">
              Last: {formatTime(lastCaptureTime)}
            </span>
          )}
        </div>
      )}

      {/* Hidden elements for capture */}
      <video 
        ref={videoRef} 
        autoPlay={true}
        playsInline={true}
        muted={true}
        style={{ 
          display: 'none',
          width: '100%',
          height: 'auto'
        }}
      />
      <canvas 
        ref={canvasRef} 
        style={{ display: 'none' }}
      />
    </div>
  );
};