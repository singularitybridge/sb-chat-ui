import React, { useState, useEffect } from 'react';
import { X, Copy, Check, ExternalLink, Code, FileCode } from 'lucide-react';
import { getToken } from '../services/api/authService';

interface WorkspaceEmbedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assistantId: string;
  assistantName: string;
  filePath: string;
}

type CodeFormat = 'iframe' | 'link' | 'react';

const WorkspaceEmbedDialog: React.FC<WorkspaceEmbedDialogProps> = ({
  isOpen,
  onClose,
  assistantId,
  assistantName,
  filePath,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<CodeFormat>('iframe');
  const [copied, setCopied] = useState(false);
  const [embedPreviewUrl, setEmbedPreviewUrl] = useState('');

  const baseUrl = window.location.origin;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const userToken = getToken();

  // For demo purposes, we'll use the user's current token
  // In production, users should create a dedicated API key for embeds
  const apiKey = userToken || 'YOUR_API_KEY';

  // Ensure filePath starts with /
  const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`;

  // Create document ID by encoding assistantId:path
  const documentId = btoa(`${assistantId}:${normalizedPath}`);

  // Build embed URL with document ID
  const embedUrl = `${baseUrl}/embed/workspace/${documentId}?apiKey=${apiKey}`;

  useEffect(() => {
    setEmbedPreviewUrl(embedUrl);
  }, [embedUrl]);

  // Listen for navigation messages from the preview iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify the message is from our embed origin
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'navigate' && event.data.path) {
        // Update the preview URL with the new path
        const newDocumentId = btoa(`${assistantId}:${event.data.path}`);
        const newEmbedUrl = `${baseUrl}/embed/workspace/${newDocumentId}?apiKey=${apiKey}`;
        setEmbedPreviewUrl(newEmbedUrl);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [assistantId, apiKey, baseUrl]);

  if (!isOpen) return null;

  /**
   * Generate embed code based on selected format
   */
  const generateCode = (): string => {
    switch (selectedFormat) {
      case 'iframe':
        return `<!-- Embed workspace file: ${normalizedPath} -->
<!-- documentId: ${documentId} (base64 encoded assistantId:path) -->
<iframe
  src="${embedUrl}"
  width="100%"
  height="600"
  frameborder="0"
  sandbox="allow-scripts allow-forms allow-same-origin"
  title="${assistantName} - ${normalizedPath}"
></iframe>`;

      case 'link':
        return embedUrl;

      case 'react':
        return `// React component for embedding workspace file
const EmbeddedWorkspaceFile = () => {
  const EMBED_BASE_URL = '${baseUrl}';
  const documentId = '${documentId}'; // base64(assistantId:filepath)
  const apiKey = '${apiKey}';

  return (
    <iframe
      src={\`\${EMBED_BASE_URL}/embed/workspace/\${documentId}?apiKey=\${apiKey}\`}
      className="w-full h-[600px] border-0"
      sandbox="allow-scripts allow-forms allow-same-origin"
      title="${assistantName} - ${normalizedPath}"
    />
  );
};`;

      default:
        return '';
    }
  };

  /**
   * Copy code to clipboard
   */
  const handleCopy = () => {
    const code = generateCode();
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  /**
   * Open embed in new window for testing
   */
  const handleTestEmbed = () => {
    window.open(embedUrl, '_blank', 'width=1000,height=800');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Embed Workspace File</h2>
            <p className="text-sm text-gray-600 mt-1">
              Share this workspace file on your website or documentation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Warning Banner */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-yellow-800">API Key Exposed in URL</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  The embed URL contains your API key. Only use this on trusted websites.
                  Consider creating a dedicated API key for embeds in Settings → API Keys.
                </p>
              </div>
            </div>
          </div>

          {/* File Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Assistant:</span>
              <span className="text-gray-900">{assistantName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">File Path:</span>
              <span className="text-gray-900 font-mono text-xs">{filePath}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Assistant ID:</span>
              <span className="text-gray-900 font-mono text-xs">{assistantId}</span>
            </div>
          </div>

          {/* Format Tabs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Embed Format
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedFormat('iframe')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  selectedFormat === 'iframe'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Code className="h-4 w-4" />
                HTML iframe
              </button>
              <button
                onClick={() => setSelectedFormat('link')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  selectedFormat === 'link'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ExternalLink className="h-4 w-4" />
                Direct Link
              </button>
              <button
                onClick={() => setSelectedFormat('react')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  selectedFormat === 'react'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FileCode className="h-4 w-4" />
                React
              </button>
            </div>
          </div>

          {/* Code Display */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {selectedFormat === 'iframe' && 'HTML Embed Code'}
                {selectedFormat === 'link' && 'Direct Link'}
                {selectedFormat === 'react' && 'React Component'}
              </label>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-gray-100 font-mono text-sm">
                <code>{generateCode()}</code>
              </pre>
            </div>
          </div>

          {/* Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Preview
              </label>
              <button
                onClick={handleTestEmbed}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Open in New Window
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <iframe
                src={embedPreviewUrl}
                className="w-full h-96 border-0"
                sandbox="allow-scripts allow-forms allow-same-origin"
                title="Embed Preview"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Learn more about{' '}
            <a
              href="https://docs.singularitybridge.net/workspace/embedding"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              workspace file embedding
            </a>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceEmbedDialog;
