import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useTranslation } from 'react-i18next';
import { IconButton } from './admin/IconButton';
import { UploadCloudIcon } from 'lucide-react';
import '../styles/monaco-editor.css';
import { writeFile } from '../services/api/integrationService';
import { useIframeCommunication } from '../services/iframeCommunicationService';
import { EVENT_ADD_IFRAME_MESSAGE } from '../utils/eventNames';
import { emitter } from '../services/mittEmitter';

interface ArtifactEditorProps {
  artifactId?: string;
}

const DUMMY_TEXT = `# Create New Content

You can:
1. Create new content here
2. Save it using the cloud icon above
3. The preview will update automatically

## Example Content
You can write markdown content here...`;

const ArtifactEditor: React.FC<ArtifactEditorProps> = ({ artifactId }) => {
  const { t } = useTranslation();
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [currentCode, setCurrentCode] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isCodeChanged, setIsCodeChanged] = React.useState(false);
  const [isNotFound, setIsNotFound] = React.useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const targetOrigin =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:5175'
      : 'https://generative-ui.singularitybridge.com';

  const previewUrl = `${targetOrigin}/page/${artifactId}`;

  const { sendMessageToIframe, handleIframeLoad } = useIframeCommunication({
    iframeRef,
    targetOrigin,
    onMessage: onIframeMessage,
  });

  function onIframeMessage(message: any) {
    console.log('Received message from iframe:', message);
    if (message.action === 'agent_request') {
      const { userInput, board } = message;
      const agentMessage = `${userInput} (Current board state: ${JSON.stringify(board)})`;
      emitter.emit(EVENT_ADD_IFRAME_MESSAGE, agentMessage);
    } else {
      // Send a test message back to the iframe for other message types
      sendMessageToIframe({
        type: 'TEST_RESPONSE',
        content: 'This is a test response from the parent.',
      });
    }
  }

  React.useEffect(() => {
    const fetchCode = async () => {
      if (artifactId) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`https://storage.googleapis.com/sb-ai-experiments-files/${artifactId}`);
          if (!response.ok) {
            if (response.status === 404) {
              setCurrentCode(DUMMY_TEXT);
              setIsNotFound(true);
              return;
            }
            throw new Error(t('ArtifactEditor.error.fetch'));
          }
          const text = await response.text();
          setCurrentCode(text);
          setIsNotFound(false);
        } catch (e) {
          if (!isNotFound) {
            setError(`${e instanceof Error ? e.message : String(e)}`);
          }
          console.error('Error fetching file:', e);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchCode();
  }, [artifactId, t, isNotFound]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCurrentCode(value);
      setIsCodeChanged(true);
    }
  };

  const handleSaveCode = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await writeFile({
        data: {
          fileId: artifactId || '',
          title: `Artifact ${artifactId}`,
          description: 'MDX content for the artifact',
          content: currentCode,
        },
      });
      setIsCodeChanged(false);
      setIsNotFound(false);
      console.log('Code saved successfully:', response);

      // Send a message to the iframe to reload content
      sendMessageToIframe({ type: 'RELOAD_CONTENT' });
    } catch (e) {
      setError(t('ArtifactEditor.error.save'));
      console.error('Error saving code:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const renderControls = () => (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center">
        <h3 className="text-gray-700 font-medium mr-2">
          {t('ArtifactEditor.title')}
        </h3>
        {isEditMode && (
          <div className="border border-slate-300 px-1 rounded-2xl">
            <IconButton
              icon={<UploadCloudIcon size={16} />}
              onClick={handleSaveCode}
              disabled={!isCodeChanged || isLoading}
              className={`p-1 rounded-full ${
                isCodeChanged && !isLoading
                  ? ' text-green-600 hover:text-green-400 '
                  : ' text-slate-400'
              }`}
            />
          </div>
        )}
      </div>
      <div className="inline-flex rounded-full border overflow-hidden text-sm">
        <button
          onClick={() => setIsEditMode(false)}
          className={`px-3 py-1.5 transition-all duration-200 ease-in-out ${
            !isEditMode
              ? 'bg-gray-100 text-gray-800 shadow-sm'
              : 'bg-white text-gray-500 hover:bg-gray-50'
          }`}
        >
          {t('ArtifactEditor.preview')}
        </button>
        <button
          onClick={() => setIsEditMode(true)}
          className={`px-3 py-1.5 transition-all duration-200 ease-in-out ${
            isEditMode
              ? 'bg-gray-100 text-gray-800 shadow-sm'
              : 'bg-white text-gray-500 hover:bg-gray-50'
          }`}
        >
          {t('ArtifactEditor.code')}
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">{t('ArtifactEditor.loading')}</div>
        </div>
      );
    }

    if (isEditMode) {
      return (
        <div className="h-full">
          {error && !isNotFound && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-600">
              {error}
            </div>
          )}
          <div className="h-full border rounded-lg overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage="markdown"
              value={currentCode}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                readOnly: false,
                automaticLayout: true,
                padding: { top: 12, bottom: 12 },
              }}
              className="monaco-editor-custom"
            />
          </div>
        </div>
      );
    }

    return (
      <iframe
        ref={iframeRef}
        src={previewUrl}
        className="w-full h-full border rounded-lg"
        title="Preview"
        style={{
          border: '1px solid #e5e7eb',
        }}
        onLoad={handleIframeLoad}
      />
    );
  };

  return (
    <div className="h-full flex flex-col">
      {renderControls()}
      <div className="flex-1 min-h-0">
        {renderContent()}
      </div>
    </div>
  );
};

export default ArtifactEditor;
