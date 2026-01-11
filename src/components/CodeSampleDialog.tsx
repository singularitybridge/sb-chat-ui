import React, { useState, useEffect } from 'react';
import { X, Copy, Check, FileCode, Link, FileText, Play, Loader2, Zap, Braces } from 'lucide-react';
import { SiJavascript, SiPython, SiCurl } from 'react-icons/si';
import { useSessionStore } from '../store/useSessionStore';
import { useAssistantStore } from '../store/useAssistantStore';
import { emitter } from '../services/mittEmitter';
import { EVENT_SHOW_NOTIFICATION } from '../utils/eventNames';
import { useTranslation } from 'react-i18next';
import { getToken } from '../services/api/authService';
import { getGlobalEmbedApiKey } from '../services/AxiosService';

interface CodeSampleDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type CodeLanguage = 'javascript' | 'python' | 'curl';
type CodeFeature = 'file' | 'url' | 'prompt' | 'streaming' | 'json';

const CodeSampleDialog: React.FC<CodeSampleDialogProps> = ({ isOpen, onClose }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<CodeLanguage>('javascript');
  const [enabledFeatures, setEnabledFeatures] = useState<Set<CodeFeature>>(new Set());
  const [copied, setCopied] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [testInput, setTestInput] = useState('Hello, how can you help me today?');
  const [testResult, setTestResult] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [showTestResult, setShowTestResult] = useState(false);
  
  const { activeSession } = useSessionStore();
  const { getAssistantById, assistantsLoaded, loadAssistants } = useAssistantStore();
  const { t } = useTranslation();

  const apiUrl = import.meta.env.VITE_API_URL || 'https://api.singularitybridge.net/';
  const embedApiKey = getGlobalEmbedApiKey();
  const userToken = getToken();
  const authToken = embedApiKey || userToken || 'YOUR_API_KEY';

  useEffect(() => {
    if (!assistantsLoaded) {
      loadAssistants();
    }
  }, [assistantsLoaded, loadAssistants]);

  const toggleFeature = (feature: CodeFeature) => {
    const newFeatures = new Set(enabledFeatures);
    if (newFeatures.has(feature)) {
      newFeatures.delete(feature);
    } else {
      newFeatures.add(feature);
    }
    setEnabledFeatures(newFeatures);
  };

  const generateCode = () => {
    if (!activeSession?.assistantId) {
      return '// No active assistant selected';
    }

    const assistant = getAssistantById(activeSession.assistantId);
    if (!assistant) {
      return '// Assistant not found';
    }

    // Always use /execute endpoint (supports both ID and name/slug)
    const endpoint = `assistant/${encodeURIComponent(assistant.name)}/execute`;
    const fullUrl = `${apiUrl.replace(/\/$/, '')}/${endpoint}`;

    if (selectedLanguage === 'javascript') {
      return generateJavaScriptCode(fullUrl, authToken, assistant);
    } else if (selectedLanguage === 'python') {
      return generatePythonCode(fullUrl, authToken, assistant);
    } else if (selectedLanguage === 'curl') {
      return generateCurlCode(fullUrl, authToken, assistant);
    }
    return '';
  };

  const generateJavaScriptCode = (url: string, token: string, assistant: any) => {
    let attachments = '';
    if (enabledFeatures.has('file')) {
      attachments = `,
    attachments: [
      {
        fileId: 'file-123',  // Or use data field for base64
        data: 'base64_encoded_file_content', // Base64 without data URL prefix
        mimeType: 'image/png',
        fileName: 'screenshot.png'
      }
    ]`;
    } else if (enabledFeatures.has('url')) {
      attachments = `,
    attachments: [
      {
        url: 'https://example.com/document.pdf',
        mimeType: 'application/pdf',
        fileName: 'document.pdf'
      }
    ]`;
    }

    const promptOverride = enabledFeatures.has('prompt') ? `,
    promptOverride: 'You are a helpful assistant specialized in...'` : '';

    const responseFormat = enabledFeatures.has('json') ? `,
    responseFormat: { type: 'json_object' }` : '';

    if (enabledFeatures.has('streaming')) {
      // Streaming version
      const streamingCode = `// Streaming API - Assistant: ${assistant.name}
const apiUrl = '${url}';
const apiKey = '${token}';

async function sendMessageWithStreaming(userInput) {
  const payload = {
    userInput: userInput${attachments}${promptOverride}${responseFormat}
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${apiKey}\`,
      'Accept': 'text/event-stream'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullMessage = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\\n');
      
      for (const line of lines) {
        if (line.startsWith('data:')) {
          try {
            const data = JSON.parse(line.slice(5));
            if (data.type === 'token') {
              fullMessage += data.value;
              // Real-time output - you can update UI here
              console.log(data.value);
              // Example: updateUI(data.value);
            } else if (data.type === 'done') {
              console.log('\\nStream completed');
              break;
            }
          } catch (e) {
            // Skip invalid JSON lines
            continue;
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
  
  return fullMessage;
}

// Usage
sendMessageWithStreaming('Hello, how can you help me today?')
  .then(response => console.log('\\nFull Assistant Response:', response))
  .catch(console.error);`;

      return streamingCode;
    } else {
      // Non-streaming version
      const baseCode = `// Stateless API - Assistant: ${assistant.name}
const apiUrl = '${url}';
const apiKey = '${token}';

async function sendMessage(userInput) {
  const payload = {
    userInput: userInput${attachments}${promptOverride}${responseFormat}
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${apiKey}\`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }

  const data = await response.json();
  return data.content || data;
}

// Usage
sendMessage('Hello, how can you help me today?')
  .then(response => console.log('Assistant:', response))
  .catch(console.error);`;

      return baseCode;
    }
  };

  const generatePythonCode = (url: string, token: string, assistant: any) => {
    let attachments = '';
    if (enabledFeatures.has('file')) {
      attachments = `,
        'attachments': [
            {
                'fileId': 'file-123',  # Or use data field for base64
                'data': 'base64_encoded_file_content',  # Base64 without data URL prefix
                'mimeType': 'image/png',
                'fileName': 'screenshot.png'
            }
        ]`;
    } else if (enabledFeatures.has('url')) {
      attachments = `,
        'attachments': [
            {
                'url': 'https://example.com/document.pdf',
                'mimeType': 'application/pdf',
                'fileName': 'document.pdf'
            }
        ]`;
    }

    const promptOverride = enabledFeatures.has('prompt') ? `,
        'promptOverride': 'You are a helpful assistant specialized in...'` : '';

    const responseFormat = enabledFeatures.has('json') ? `,
        'responseFormat': {'type': 'json_object'}` : '';

    if (enabledFeatures.has('streaming')) {
      // Streaming version
      const streamingCode = `# Streaming API - Assistant: ${assistant.name}
import requests
import json

api_url = '${url}'
api_key = '${token}'

def send_message_with_streaming(user_input):
    payload = {
        'userInput': user_input${attachments}${promptOverride}${responseFormat}
    }
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}',
        'Accept': 'text/event-stream'
    }
    
    response = requests.post(api_url, json=payload, headers=headers, stream=True)
    
    if response.status_code != 200:
        raise Exception(f'HTTP error! status: {response.status_code}')
    
    full_message = ''
    
    try:
        for line in response.iter_lines(decode_unicode=True):
            if line and line.startswith('data:'):
                try:
                    data = json.loads(line[5:])  # Remove 'data:' prefix
                    if data.get('type') == 'token':
                        token_value = data.get('value', '')
                        full_message += token_value
                        # Real-time output - you can update UI here
                        print(token_value, end='', flush=True)
                    elif data.get('type') == 'done':
                        print('\\nStream completed')
                        break
                except json.JSONDecodeError:
                    # Skip invalid JSON lines
                    continue
    finally:
        response.close()
    
    return full_message

# Usage
response = send_message_with_streaming('Hello, how can you help me today?')
print('\\nFull Assistant Response:', response)`;

      return streamingCode;
    } else {
      // Non-streaming version
      const baseCode = `# Stateless API - Assistant: ${assistant.name}
import requests
import json

api_url = '${url}'
api_key = '${token}'

def send_message(user_input):
    payload = {
        'userInput': user_input${attachments}${promptOverride}${responseFormat}
    }
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }
    
    response = requests.post(api_url, json=payload, headers=headers)
    
    if response.status_code != 200:
        raise Exception(f'HTTP error! status: {response.status_code}')
    
    data = response.json()
    return data.get('content', data)

# Usage
response = send_message('Hello, how can you help me today?')
print('Assistant:', response)`;

      return baseCode;
    }
  };

  const generateCurlCode = (url: string, token: string, assistant: any) => {
    let payload: any = {
      userInput: 'Hello, how can you help me today?'
    };

    if (enabledFeatures.has('file')) {
      payload.attachments = [
        {
          fileId: 'file-123',  // Or use data field for base64
          data: 'base64_encoded_file_content',
          mimeType: 'image/png',
          fileName: 'screenshot.png'
        }
      ];
    } else if (enabledFeatures.has('url')) {
      payload.attachments = [
        {
          url: 'https://example.com/document.pdf',
          mimeType: 'application/pdf',
          fileName: 'document.pdf'
        }
      ];
    }

    if (enabledFeatures.has('prompt')) {
      payload.promptOverride = 'You are a helpful assistant specialized in...';
    }

    if (enabledFeatures.has('json')) {
      payload.responseFormat = { type: 'json_object' };
    }

    if (enabledFeatures.has('streaming')) {
      // Streaming version
      let curlCommand = `# Streaming API - Assistant: ${assistant.name}\ncurl -X POST '${url}' \\\\\n`;
      curlCommand += `  -H 'Content-Type: application/json' \\\\\n`;
      curlCommand += `  -H 'Authorization: Bearer ${token}' \\\\\n`;
      curlCommand += `  -H 'Accept: text/event-stream' \\\\\n`;
      curlCommand += `  -d '${JSON.stringify(payload, null, 2).replace(/'/g, "\\'")}' \\\\\n`;
      curlCommand += `  --no-buffer`;
      
      curlCommand += `

# Expected output format:
# data:{"type":"token","value":"Hello"}
# data:{"type":"token","value":" there"}
# data:{"type":"done"}

# To process streaming in bash:
curl -X POST '${url}' \\\\
  -H 'Content-Type: application/json' \\\\
  -H 'Authorization: Bearer ${token}' \\\\
  -H 'Accept: text/event-stream' \\\\
  -d '${JSON.stringify(payload, null, 2).replace(/'/g, "\\'")}' \\\\
  --no-buffer | while IFS= read -r line; do
  if [[ \$line == data:* ]]; then
    json_data="\${line:5}"  # Remove "data:" prefix
    echo "\$json_data" | jq -r 'select(.type == "token") | .value' 2>/dev/null | tr -d '\\n'
  fi
done`;

      return curlCommand;
    } else {
      // Non-streaming version
      let curlCommand = `# Stateless API - Assistant: ${assistant.name}\ncurl -X POST '${url}' \\\\\n`;
      curlCommand += `  -H 'Content-Type: application/json' \\\\\n`;
      curlCommand += `  -H 'Authorization: Bearer ${token}' \\\\\n`;
      curlCommand += `  -d '${JSON.stringify(payload, null, 2).replace(/'/g, "\\'")}'`;

      return curlCommand;
    }
  };

  useEffect(() => {
    setGeneratedCode(generateCode());
  }, [selectedLanguage, enabledFeatures, activeSession?.assistantId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      emitter.emit(EVENT_SHOW_NOTIFICATION, {
        message: t('CodeSample.copySuccess') || 'Code copied to clipboard',
        type: 'success',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
      emitter.emit(EVENT_SHOW_NOTIFICATION, {
        message: t('CodeSample.copyFailed') || 'Failed to copy code',
        type: 'error',
      });
    }
  };

  const handleTest = async () => {
    if (!activeSession?.assistantId || !testInput.trim()) {
      return;
    }

    const assistant = getAssistantById(activeSession.assistantId);
    if (!assistant) {
      emitter.emit(EVENT_SHOW_NOTIFICATION, {
        message: 'Assistant not found',
        type: 'error',
      });
      return;
    }

    setIsTesting(true);
    setShowTestResult(true);
    setTestResult('');

    try {
      // Always use /execute endpoint with assistant name
      const endpoint = `assistant/${encodeURIComponent(assistant.name)}/execute`;
      const fullUrl = `${apiUrl.replace(/\/$/, '')}/${endpoint}`;

      const payload: any = {
        userInput: testInput
      };

      // Add prompt override if enabled
      if (enabledFeatures.has('prompt')) {
        payload.promptOverride = 'You are a helpful assistant specialized in providing concise responses.';
      }

      // Add response format if JSON mode enabled
      if (enabledFeatures.has('json')) {
        payload.responseFormat = { type: 'json_object' };
      }

      const headers: any = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };

      // Add streaming header if streaming mode is enabled
      if (enabledFeatures.has('streaming')) {
        headers['Accept'] = 'text/event-stream';
      }

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (enabledFeatures.has('streaming')) {
        // Handle streaming response
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Failed to get response reader');
        }

        const decoder = new TextDecoder();
        let fullMessage = '';
        let buffer = '';
        
        // Show streaming indicator
        setTestResult('● Streaming...\n\n');

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            const lines = buffer.split('\n');
            
            // Keep the last incomplete line in the buffer
            buffer = lines.pop() || '';
            
            for (const line of lines) {
              if (line.trim().startsWith('data:')) {
                try {
                  const jsonStr = line.replace(/^data:\s*/, '');
                  if (jsonStr === '[DONE]') {
                    setTestResult(prev => prev.replace('● Streaming...\n\n', '✓ Stream completed\n\n'));
                    break;
                  }
                  
                  const data = JSON.parse(jsonStr);
                  if (data.type === 'token' && data.value) {
                    fullMessage += data.value;
                    // Update result progressively with visible streaming effect
                    setTestResult(prev => {
                      const baseText = prev.includes('● Streaming...') 
                        ? prev.replace('● Streaming...\n\n', '● Streaming...\n\n')
                        : prev;
                      return baseText.replace(/● Streaming\.\.\.\n\n.*$/, `● Streaming...\n\n${fullMessage}`);
                    });
                    
                    // Small delay to make streaming visible
                    await new Promise(resolve => setTimeout(resolve, 10));
                  } else if (data.type === 'done') {
                    setTestResult(`✓ Stream completed\n\n${fullMessage}`);
                    break;
                  } else if (data.type === 'error') {
                    setTestResult(`✗ Stream error: ${data.message || 'Unknown error'}\n\n${fullMessage}`);
                    break;
                  }
                } catch (e) {
                  // Skip invalid JSON lines
                  console.debug('Skipping invalid SSE line:', line);
                  continue;
                }
              }
            }
          }
          
          // Process any remaining buffer
          if (buffer && buffer.trim().startsWith('data:')) {
            try {
              const jsonStr = buffer.replace(/^data:\s*/, '');
              const data = JSON.parse(jsonStr);
              if (data.type === 'token' && data.value) {
                fullMessage += data.value;
                setTestResult(`✓ Stream completed\n\n${fullMessage}`);
              }
            } catch (e) {
              // Ignore
            }
          }
          
          // If we didn't get a done signal, still mark as complete
          if (!testResult.includes('✓ Stream completed') && !testResult.includes('✗ Stream error')) {
            setTestResult(`✓ Stream completed\n\n${fullMessage}`);
          }
        } finally {
          reader.releaseLock();
        }
      } else {
        // Handle regular JSON response
        const data = await response.json();

        // If JSON mode is enabled, show full response
        if (enabledFeatures.has('json')) {
          const prettyJson = JSON.stringify(data, null, 2);
          setTestResult(prettyJson);
        } else {
          // Extract the actual content from the response
          let resultText = '';
          if (typeof data === 'string') {
            resultText = data;
          } else if (data?.content) {
            if (Array.isArray(data.content) && data.content[0]?.text?.value) {
              resultText = data.content[0].text.value;
            } else if (typeof data.content === 'string') {
              resultText = data.content;
            } else {
              resultText = JSON.stringify(data.content, null, 2);
            }
          } else {
            resultText = JSON.stringify(data, null, 2);
          }

          setTestResult(resultText);
        }
      }
    } catch (error: any) {
      console.error('Test failed:', error);
      setTestResult(`✗ Error: ${error.message}`);
      emitter.emit(EVENT_SHOW_NOTIFICATION, {
        message: 'Test failed: ' + error.message,
        type: 'error',
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (!isOpen) return null;

  const languageIcons = {
    javascript: { 
      Icon: SiJavascript,
      label: 'JavaScript',
      color: '#F7DF1E'
    },
    python: { 
      Icon: SiPython,
      label: 'Python',
      color: '#3776AB'
    },
    curl: { 
      Icon: SiCurl,
      label: 'cURL',
      color: '#073551'
    }
  };

  const featureIcons = {
    file: { icon: <FileText className="w-4 h-4" />, label: 'File Upload' },
    url: { icon: <Link className="w-4 h-4" />, label: 'URL Attachment' },
    prompt: { icon: <FileCode className="w-4 h-4" />, label: 'Prompt Override' },
    streaming: { icon: <Zap className="w-4 h-4" />, label: 'Streaming Mode' },
    json: { icon: <Braces className="w-4 h-4" />, label: 'JSON Response' }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Minimal Header */}
        <div className="flex items-center justify-between px-4 py-2.5">
          <h2 className="text-sm font-medium text-gray-700">Code Sample</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>

        {/* Ultra Minimal Controls Bar */}
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="flex items-center justify-between">
            {/* Language Section */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">Language</span>
              <div className="flex items-center gap-1">
                {(Object.keys(languageIcons) as CodeLanguage[]).map((lang) => {
                  const { Icon, label, color } = languageIcons[lang];
                  const IconComponent = Icon as any;
                  return (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className="p-1.5 rounded transition-all hover:bg-gray-50"
                      title={label}
                    >
                      <IconComponent 
                        className="w-3.5 h-3.5" 
                        style={{ 
                          color: selectedLanguage === lang ? '#7C3AED' : '#9CA3AF',
                          transition: 'color 0.15s'
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Options Section */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">Options</span>
              <div className="flex items-center gap-1">
                {(Object.keys(featureIcons) as CodeFeature[]).map((feature) => (
                  <button
                    key={feature}
                    onClick={() => toggleFeature(feature)}
                    className="p-1.5 rounded transition-all hover:bg-gray-50"
                    title={featureIcons[feature].label}
                  >
                    {React.cloneElement(featureIcons[feature].icon, {
                      className: 'w-3.5 h-3.5',
                      style: {
                        color: enabledFeatures.has(feature) ? '#7C3AED' : '#9CA3AF',
                        transition: 'color 0.15s'
                      }
                    })}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Test Input Section */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Enter test message..."
              className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-hidden focus:border-purple-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isTesting) {
                  handleTest();
                }
              }}
            />
            <button
              onClick={handleTest}
              disabled={isTesting || !activeSession?.assistantId || !testInput.trim()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                isTesting || !activeSession?.assistantId || !testInput.trim()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Test API</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Display */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="relative flex-1 bg-gray-900 overflow-auto" style={{ minHeight: showTestResult ? '200px' : '300px', maxHeight: showTestResult ? '300px' : '450px' }}>
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 z-10 p-1.5 rounded transition-all hover:bg-gray-800"
              title={copied ? 'Copied!' : 'Copy code'}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5" style={{ color: '#7C3AED' }} />
              ) : (
                <Copy className="w-3.5 h-3.5" style={{ color: '#9CA3AF' }} />
              )}
            </button>
            <pre className="text-gray-100 p-5 min-w-max">
              <code className="text-xs leading-relaxed font-mono">{generatedCode}</code>
            </pre>
          </div>

          {/* Test Result Display */}
          {showTestResult && (
            <div className="border-t border-gray-700 bg-gray-800" style={{ minHeight: '150px', maxHeight: '200px' }}>
              <div className="px-4 py-2 border-b border-gray-700 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">Test Result</span>
                <button
                  onClick={() => setShowTestResult(false)}
                  className="p-1 rounded hover:bg-gray-700 transition-colors"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              </div>
              <div className="p-4 overflow-auto" style={{ maxHeight: '160px' }}>
                {isTesting && !testResult ? (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs">Connecting to API...</span>
                  </div>
                ) : testResult ? (
                  <pre className={`text-xs whitespace-pre-wrap font-mono ${
                    testResult.startsWith('● Streaming') 
                      ? 'text-purple-400' 
                      : testResult.startsWith('✓') 
                      ? 'text-green-400' 
                      : testResult.startsWith('✗') 
                      ? 'text-red-400' 
                      : 'text-gray-300'
                  }`}>
                    {testResult.startsWith('● Streaming') && (
                      <span className="inline-block animate-pulse">{testResult.split('\n')[0]}</span>
                    )}
                    {testResult.startsWith('● Streaming') 
                      ? '\n\n' + testResult.split('\n\n').slice(1).join('\n\n')
                      : testResult}
                  </pre>
                ) : (
                  <span className="text-xs text-gray-500">No result yet</span>
                )}
              </div>
            </div>
          )}

          {/* Minimal Info Bar */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="font-mono">{activeSession?.assistantId ? `ID: ${activeSession.assistantId.slice(0, 8)}...` : 'No assistant selected'}</span>
              {authToken === 'YOUR_API_KEY' && (
                <span className="text-amber-600">⚠ Replace API key</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeSampleDialog;