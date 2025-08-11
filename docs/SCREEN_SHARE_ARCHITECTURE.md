# Advanced Screen Sharing Architecture

## Executive Summary

Based on analysis of the codebase, the application is well-positioned to implement advanced screen sharing with AI analysis. The existing architecture provides strong foundations with session management, real-time communication (Pusher), and both stateless/stateful AI interaction patterns.

## Current Architecture Strengths

### ✅ Existing Capabilities We Can Leverage

1. **Stateless AI Analysis** - `getCompletion()` API endpoint perfect for one-off screen analysis
2. **Session Management** - Robust session state via Zustand stores
3. **Real-time Communication** - Pusher channels for bidirectional AI-user communication
4. **File Handling** - Complete pipeline for image uploads with metadata
5. **Action System** - AI can trigger actions that UI responds to
6. **Streaming Support** - Server-Sent Events for continuous analysis updates

## Proposed Architecture

### 1. Screen Sharing Session Manager

```typescript
// New store: useScreenShareStore.ts
interface ScreenShareSession {
  id: string;
  status: 'idle' | 'active' | 'analyzing' | 'paused';
  stream: MediaStream | null;
  captureMode: 'manual' | 'interval' | 'ai-triggered';
  analysisMode: 'stateless' | 'session-context';
  captureInterval: number;
  lastCapture: Date | null;
  analysisResults: AnalysisResult[];
  aiRequests: AIScreenRequest[];
}

interface AnalysisResult {
  timestamp: Date;
  screenshot: Blob;
  analysis: string;
  regions?: DetectedRegion[];
  suggestions?: string[];
}

interface AIScreenRequest {
  id: string;
  type: 'capture' | 'highlight' | 'analyze-region';
  payload: any;
  status: 'pending' | 'completed' | 'rejected';
}
```

### 2. Dual Analysis Modes

#### Stateless Analysis (Quick Insights)
- Use `/assistant/completion` endpoint
- No session context pollution
- Perfect for "What's this?" queries
- Lower latency, no streaming overhead

#### Session-Integrated Analysis
- Use existing `/assistant/user-input` with file attachments
- Maintains conversation context
- AI can reference previous screenshots
- Enables follow-up questions

### 3. AI-Initiated Screenshot Requests

Using existing Pusher infrastructure:

```typescript
// AI sends action via existing action system
{
  type: 'action',
  payload: {
    actionType: 'request_screenshot',
    parameters: {
      focus: 'specific-element',
      selector: '.error-message',
      reason: 'Need to see current error state'
    }
  }
}

// Client responds with screenshot
handleAIScreenRequest(request) {
  // Capture specific area or full screen
  const screenshot = await captureScreen(request.parameters);
  // Send back via regular message flow
  sendScreenshot(screenshot, { requestId: request.id });
}
```

### 4. Implementation Components

#### Core Services

```typescript
// services/screenShareService.ts
class ScreenShareService {
  // Screen capture management
  async startCapture(options: CaptureOptions): Promise<MediaStream>
  async captureScreenshot(): Promise<Blob>
  async captureRegion(selector: string): Promise<Blob>
  
  // AI analysis
  async analyzeScreenshot(blob: Blob, prompt?: string): Promise<AnalysisResult>
  async analyzeWithContext(blob: Blob, sessionId: string): Promise<void>
  
  // Annotation & overlay
  async highlightRegion(region: DetectedRegion): Promise<void>
  async addAnnotation(text: string, position: Point): Promise<void>
}
```

#### React Components

```typescript
// components/ScreenShareSession.tsx
- Main container for screen sharing UI
- Manages capture stream lifecycle
- Displays analysis results
- Handles AI requests

// components/ScreenAnnotationOverlay.tsx
- Canvas overlay for visual annotations
- Highlights AI-detected regions
- Shows analysis tooltips
- Interactive region selection

// components/AnalysisPanel.tsx
- Displays analysis history
- Shows AI insights
- Manages stateless vs session mode toggle
```

## Technical Implementation Details

### Browser APIs to Use

1. **Screen Capture**
   - `navigator.mediaDevices.getDisplayMedia()` - Primary capture API
   - `OffscreenCanvas` - Performance optimization for processing
   - `VideoFrame` API - Efficient frame extraction

2. **Image Processing**
   - `Canvas 2D Context` - Basic image manipulation
   - `WebCodecs API` - Advanced video processing
   - `createImageBitmap()` - Efficient image handling

### Libraries & Tools Recommendations

#### For Annotation & Visualization
- **Konva.js** - Powerful 2D canvas library for annotations
- **Fabric.js** - Interactive canvas with object model
- **Rough.js** - Hand-drawn style annotations

#### For Performance
- **Comlink** - Web Worker integration for heavy processing
- **sharp-browser** - Client-side image optimization
- **pica** - High-quality image resizing

#### For AI Integration
- **Transformers.js** - Run lightweight ML models in browser
- **ONNX Runtime Web** - Deploy ONNX models client-side
- **MediaPipe** - Google's CV solutions (object detection, segmentation)

### API Endpoints to Add/Modify

```typescript
// New endpoint for stateless analysis with metadata
POST /api/assistant/analyze-screenshot
{
  image: base64,
  prompt?: string,
  mode: 'quick' | 'detailed',
  includeRegions?: boolean
}

// WebSocket endpoint for real-time analysis
WS /api/assistant/screen-share-session
- Bidirectional screenshot streaming
- Real-time analysis results
- AI request handling
```

## Implementation Phases

### Phase 1: Basic Infrastructure (Week 1)
- [ ] Create `useScreenShareStore`
- [ ] Implement basic screen capture service
- [ ] Add stateless analysis via existing `/completion` endpoint
- [ ] Basic UI for starting/stopping capture

### Phase 2: AI Integration (Week 2)
- [ ] Implement AI screenshot request handling
- [ ] Add Pusher event handlers for AI actions
- [ ] Create analysis result display
- [ ] Add session vs stateless toggle

### Phase 3: Advanced Features (Week 3)
- [ ] Canvas overlay for annotations
- [ ] Region-specific capture
- [ ] Analysis history timeline
- [ ] Performance optimizations

### Phase 4: Polish & Optimization (Week 4)
- [ ] Add visual effects and transitions
- [ ] Implement smart throttling
- [ ] Add user preferences
- [ ] Error handling & recovery

## Performance Considerations

### Throttling Strategy
```typescript
// Adaptive throttling based on AI response time
const adaptiveThrottle = {
  minInterval: 1000,  // 1 second minimum
  maxInterval: 30000, // 30 seconds maximum
  adjust(responseTime: number) {
    if (responseTime > 2000) {
      this.currentInterval = Math.min(this.currentInterval * 1.5, this.maxInterval);
    } else {
      this.currentInterval = Math.max(this.currentInterval * 0.8, this.minInterval);
    }
  }
}
```

### Memory Management
- Limit analysis history to last 50 results
- Compress screenshots before storage
- Use IndexedDB for temporary storage
- Clean up blobs after upload

## Security & Privacy

1. **User Consent**
   - Clear permission prompts
   - Visible recording indicators
   - Easy stop mechanism

2. **Data Handling**
   - Don't store screenshots permanently
   - Encrypt in-transit data
   - Clear session data on logout

3. **AI Safety**
   - Rate limit analysis requests
   - Validate AI responses
   - Sanitize detected regions

## Limitations to Address

1. **Browser Constraints**
   - Screen capture requires user permission each session
   - Can't capture outside browser in some contexts
   - Mobile support limited

2. **Performance**
   - High-frequency capture impacts performance
   - Large screenshots consume bandwidth
   - AI analysis adds latency

3. **AI Capabilities**
   - Current models may miss UI nuances
   - Context window limits for multiple screenshots
   - Cost considerations for frequent analysis

## Conclusion

The application's architecture is well-suited for implementing advanced screen sharing with AI analysis. By leveraging existing patterns (sessions, Pusher, file handling) and adding targeted new components, we can create a powerful screen sharing experience that enables:

1. Real-time AI analysis of screen content
2. Bidirectional AI-user interaction
3. Both contextual and stateless analysis modes
4. Visual annotations and highlights
5. Smart session management

The key is to build incrementally, starting with basic capture and analysis, then adding advanced features like AI-initiated requests and visual overlays.