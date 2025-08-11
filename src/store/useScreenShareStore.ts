import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { getCompletion } from '../services/api/assistantService';
import { uploadContentFile } from '../services/api/contentFileService';
import { getToken } from '../services/api/authService';

interface DetectedRegion {
  id: string;
  type: 'button' | 'text' | 'image' | 'input' | 'error' | 'other';
  bounds: { x: number; y: number; width: number; height: number };
  confidence: number;
  description?: string;
}

interface AnalysisResult {
  id: string;
  timestamp: Date;
  screenshot: Blob;
  thumbnailUrl?: string;
  analysis: string;
  regions?: DetectedRegion[];
  suggestions?: string[];
  mode: 'stateless' | 'session';
}


interface ScreenShareState {
  // Session state
  isActive: boolean;
  sessionId: string | null;
  status: 'idle' | 'capturing' | 'analyzing' | 'paused' | 'error';
  
  // Capture configuration
  stream: MediaStream | null;
  captureMode: 'manual' | 'interval' | 'ai-triggered';
  captureInterval: number;
  analysisMode: 'stateless' | 'session';
  
  // History & results
  analysisHistory: AnalysisResult[];
  lastCaptureTime: Date | null;
  captureCount: number;
  
  // Performance metrics
  averageAnalysisTime: number;
  throttleMultiplier: number;
  
  // Actions
  startSession: (options?: SessionOptions) => Promise<void>;
  stopSession: () => void;
  captureScreenshot: (options?: CaptureOptions) => Promise<Blob | null>;
  analyzeScreenshot: (blob: Blob, prompt?: string) => Promise<AnalysisResult>;
  toggleAnalysisMode: () => void;
  setCaptureInterval: (interval: number) => void;
  clearHistory: () => void;
  
  // Utilities
  getLatestAnalysis: () => AnalysisResult | null;
}

interface SessionOptions {
  captureMode?: 'manual' | 'interval' | 'ai-triggered';
  analysisMode?: 'stateless' | 'session';
  captureInterval?: number;
}

interface CaptureOptions {
  region?: { x: number; y: number; width: number; height: number };
  quality?: number;
  format?: 'png' | 'jpeg' | 'webp';
}

const MAX_HISTORY_SIZE = 50;
const MIN_CAPTURE_INTERVAL = 1000;
const MAX_CAPTURE_INTERVAL = 60000;

export const useScreenShareStore = create<ScreenShareState>()(
  devtools(
    (set, get) => ({
      // Initial state
      isActive: false,
      sessionId: null,
      status: 'idle',
      stream: null,
      captureMode: 'manual',
      captureInterval: 5000,
      analysisMode: 'stateless',
      analysisHistory: [],
      lastCaptureTime: null,
      captureCount: 0,
      averageAnalysisTime: 0,
      throttleMultiplier: 1,

      // Start screen sharing session
      startSession: async (options = {}) => {
        const { captureMode = 'manual', analysisMode = 'stateless', captureInterval = 5000 } = options;
        
        // Prevent duplicate calls
        const currentState = get();
        if (currentState.isActive || currentState.status === 'capturing') {
          console.log('Screen sharing already active or in progress, skipping...');
          return;
        }
        
        try {
          set({ status: 'capturing' });
          
          // Request screen capture permission
          const mediaStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: false
          });
          
          const sessionId = `screen-${Date.now()}`;
          
          // Handle stream end
          mediaStream.getVideoTracks()[0].addEventListener('ended', () => {
            get().stopSession();
          });
          
          set({
            isActive: true,
            sessionId,
            stream: mediaStream,
            captureMode,
            analysisMode,
            captureInterval,
            status: 'idle',
            captureCount: 0
          });
          
          // Start interval capture if configured
          if (captureMode === 'interval') {
            // Start the capture loop
            const captureLoop = async () => {
              const state = get();
              
              if (!state.isActive || state.captureMode !== 'interval') {
                return;
              }
              
              const screenshot = await state.captureScreenshot();
              if (screenshot) {
                await state.analyzeScreenshot(screenshot);
              }
              
              // Schedule next capture with adaptive throttling
              const nextInterval = state.captureInterval * state.throttleMultiplier;
              setTimeout(captureLoop, nextInterval);
            };
            
            // Start the loop
            setTimeout(captureLoop, get().captureInterval);
          }
          
          console.log('Screen share session started:', sessionId);
        } catch (error) {
          console.error('Failed to start screen share:', error);
          set({ status: 'error', isActive: false });
          throw error;
        }
      },

      // Stop screen sharing session
      stopSession: () => {
        const state = get();
        
        if (state.stream) {
          state.stream.getTracks().forEach(track => track.stop());
        }
        
        // Clean up blob URLs
        state.analysisHistory.forEach(result => {
          if (result.thumbnailUrl) {
            URL.revokeObjectURL(result.thumbnailUrl);
          }
        });
        
        set({
          isActive: false,
          sessionId: null,
          status: 'idle',
          stream: null,
          lastCaptureTime: null
        });
        
        console.log('Screen share session stopped');
      },

      // Capture a screenshot
      captureScreenshot: async (options = {}) => {
        const state = get();
        
        if (!state.isActive || !state.stream) {
          console.error('No active screen share session');
          return null;
        }
        
        const { quality = 0.9, format = 'png' } = options;
        
        try {
          // Create video element
          const video = document.createElement('video');
          video.srcObject = state.stream;
          video.autoplay = true;
          video.playsInline = true;
          
          // Wait for video to be ready
          await new Promise((resolve) => {
            video.onloadedmetadata = () => {
              video.play().then(resolve);
            };
          });
          
          // Wait for first frame
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Create canvas and capture
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Failed to get canvas context');
          
          // Apply region crop if specified
          if (options.region) {
            const { x, y, width, height } = options.region;
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(video, x, y, width, height, 0, 0, width, height);
          } else {
            ctx.drawImage(video, 0, 0);
          }
          
          // Convert to blob
          return new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  set(state => ({
                    lastCaptureTime: new Date(),
                    captureCount: state.captureCount + 1
                  }));
                  resolve(blob);
                } else {
                  reject(new Error('Failed to create blob'));
                }
              },
              `image/${format}`,
              quality
            );
          });
        } catch (error) {
          console.error('Failed to capture screenshot:', error);
          return null;
        }
      },

      // Analyze a screenshot
      analyzeScreenshot: async (blob: Blob, prompt?: string) => {
        const state = get();
        const startTime = Date.now();
        
        set({ status: 'analyzing' });
        
        try {
          let analysis: string;
          
          if (state.analysisMode === 'stateless') {
            // Use stateless completion API with proper image format
            const dataUrl = await blobToBase64(blob);
            // Extract just the base64 string (remove "data:image/png;base64," prefix)
            const base64Image = dataUrl.split(',')[1];
            
            const systemPrompt = 'You are an AI assistant analyzing screenshots. Describe what you see clearly and concisely, identify UI elements, and provide insights.';
            const userInput = prompt || 'Analyze this screenshot and describe what you see. Identify any important UI elements or issues.';
            
            // Get the API URL from environment variable
            const apiUrl = import.meta.env.VITE_API_URL || 'https://api.singularitybridge.net/';
            
            // Get the auth token using the same method as the rest of the app
            const token = getToken(); // This gets 'userToken' from localStorage
            
            // Build headers object
            const headers: any = {
              'Content-Type': 'application/json'
            };
            
            if (token) {
              headers['Authorization'] = `Bearer ${token}`;
            }
            
            // Send request with imageBase64 field as per API requirements
            const response = await fetch(`${apiUrl}/assistant/completion`, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                systemPrompt,
                userInput,
                imageBase64: base64Image,  // Just the base64 string, no prefix
                model: 'gpt-4.1-mini',
                temperature: 0.7,
                maxTokens: 12500
              })
            });
            
            if (!response.ok) {
              throw new Error(`API request failed: ${response.statusText}`);
            }
            
            const result = await response.json();
            analysis = result.content || 'No analysis available';
            
            console.log('Screenshot analysis received:', analysis);
          } else {
            // Use session-based analysis (would need to upload and send via chat)
            const formData = new FormData();
            formData.append('file', blob, `screenshot-${Date.now()}.png`);
            
            const uploadResponse = await uploadContentFile(formData);
            analysis = `Screenshot uploaded: ${uploadResponse.data?.url || 'Processing...'}`;
            
            // Would trigger chat message here with the uploaded file
          }
          
          // Create analysis result
          const result: AnalysisResult = {
            id: `analysis-${Date.now()}`,
            timestamp: new Date(),
            screenshot: blob,
            thumbnailUrl: URL.createObjectURL(blob),
            analysis,
            regions: detectRegionsFromAnalysis(analysis),
            suggestions: extractSuggestions(analysis),
            mode: state.analysisMode
          };
          
          // Update performance metrics
          const analysisTime = Date.now() - startTime;
          const newAverage = (state.averageAnalysisTime * state.analysisHistory.length + analysisTime) / (state.analysisHistory.length + 1);
          
          // Adaptive throttling
          let newThrottle = state.throttleMultiplier;
          if (analysisTime > 3000) {
            newThrottle = Math.min(newThrottle * 1.2, 3);
          } else if (analysisTime < 1000) {
            newThrottle = Math.max(newThrottle * 0.9, 0.5);
          }
          
          // Add to history (with size limit)
          set(state => ({
            analysisHistory: [result, ...state.analysisHistory].slice(0, MAX_HISTORY_SIZE),
            status: 'idle',
            averageAnalysisTime: newAverage,
            throttleMultiplier: newThrottle
          }));
          
          return result;
        } catch (error) {
          console.error('Failed to analyze screenshot:', error);
          set({ status: 'error' });
          throw error;
        }
      },

      // Toggle between stateless and session analysis modes
      toggleAnalysisMode: () => {
        set(state => ({
          analysisMode: state.analysisMode === 'stateless' ? 'session' : 'stateless'
        }));
      },

      // Set capture interval
      setCaptureInterval: (interval: number) => {
        const clampedInterval = Math.max(MIN_CAPTURE_INTERVAL, Math.min(MAX_CAPTURE_INTERVAL, interval));
        set({ captureInterval: clampedInterval });
      },

      // Clear analysis history
      clearHistory: () => {
        const state = get();
        
        // Clean up blob URLs
        state.analysisHistory.forEach(result => {
          if (result.thumbnailUrl) {
            URL.revokeObjectURL(result.thumbnailUrl);
          }
        });
        
        set({ analysisHistory: [] });
      },

      // Get latest analysis result
      getLatestAnalysis: () => {
        const state = get();
        return state.analysisHistory[0] || null;
      }
    }),
    {
      name: 'screen-share-store'
    }
  )
);

// Helper functions
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function detectRegionsFromAnalysis(analysis: string): DetectedRegion[] {
  // Placeholder - would use actual AI response parsing
  const regions: DetectedRegion[] = [];
  
  // Simple keyword detection for demo
  if (analysis.toLowerCase().includes('button')) {
    regions.push({
      id: `region-${Date.now()}`,
      type: 'button',
      bounds: { x: 0, y: 0, width: 100, height: 40 },
      confidence: 0.8,
      description: 'Detected button element'
    });
  }
  
  return regions;
}

function extractSuggestions(analysis: string): string[] {
  // Placeholder - would parse actual AI suggestions
  const suggestions: string[] = [];
  
  if (analysis.toLowerCase().includes('error')) {
    suggestions.push('Fix the error message visibility');
  }
  
  if (analysis.toLowerCase().includes('button')) {
    suggestions.push('Consider making buttons more prominent');
  }
  
  return suggestions;
}