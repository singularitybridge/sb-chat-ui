import React from 'react';
import Editor from '@monaco-editor/react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconButton } from './admin/IconButton';
import { UploadCloudIcon } from 'lucide-react';
import '../styles/monaco-editor.css';
import { writeFile } from '../services/api/IntegrationService';

interface DynamicCodeRendererProps {
  code?: string;
  documentId?: string;
}

const sampleCode = `
function DemoComponent() {
  const [count, setCount] = React.useState(0);
  
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-700">Dynamic Component Demo</h2>
      <p className="mb-4">This component was dynamically rendered!</p>
      <div className="flex items-center gap-4">
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => setCount(prev => prev + 1)}
        >
          Click me
        </button>
        <span className="text-lg">Count: {count}</span>
      </div>
    </div>
  );
}`.trim();

const DynamicCodeRenderer: React.FC<DynamicCodeRendererProps> = ({ code: initialCode, documentId }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [currentCode, setCurrentCode] = React.useState(initialCode || sampleCode);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isCodeChanged, setIsCodeChanged] = React.useState(false);
  const [fileId, setFileId] = React.useState<string | null>(null);

  const getId = () => {
    const matches = location.pathname.match(/\/admin\/assistants\/focus\/([^/]+)/);
    return matches ? matches[1] : '';
  };

  const id = getId();
  const previewUrl = `http://localhost:5175/page/${id}`;

  React.useEffect(() => {
    const fetchCode = async () => {
      if (documentId) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`https://storage.googleapis.com/sb-ai-experiments-files/${documentId}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const text = await response.text();
          setCurrentCode(text);
          setFileId(documentId);
        } catch (e) {
          setError(`Failed to fetch file: ${e instanceof Error ? e.message : String(e)}`);
          console.error('Error fetching file:', e);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchCode();
  }, [documentId]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCurrentCode(value);
      setIsCodeChanged(true);
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleSaveCode = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await writeFile({
        data: {
          fileId: fileId || '',
          title: `Code for ${id}`,
          description: 'Dynamically rendered code',
          content: currentCode,
        },
      });
      setFileId(response._id);
      setIsCodeChanged(false);
      console.log('Code saved successfully:', response);
    } catch (e) {
      setError(`Failed to save code: ${e instanceof Error ? e.message : String(e)}`);
      console.error('Error saving code:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const renderControls = () => (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center">
        <h3 className="text-gray-700 font-medium mr-2">
          {t('DynamicCodeRenderer.title')}
        </h3>
        {isEditMode && (
          <div className='border border-slate-300 px-1 rounded-2xl'>
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
          {t('DynamicCodeRenderer.preview')}
        </button>
        <button
          onClick={() => setIsEditMode(true)}
          className={`px-3 py-1.5 transition-all duration-200 ease-in-out ${
            isEditMode 
              ? 'bg-gray-100 text-gray-800 shadow-sm' 
              : 'bg-white text-gray-500 hover:bg-gray-50'
          }`}
        >
          {t('DynamicCodeRenderer.code')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {renderControls()}
      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">{t('DynamicCodeRenderer.loading')}</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-500">{error}</div>
          </div>
        ) : isEditMode ? (
          <div className="h-full">
            <div className="h-full border rounded-lg overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="javascript"
                value={currentCode}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  readOnly: false,
                  automaticLayout: true,
                  padding: { top: 12, bottom: 12 },
                }}
                className="monaco-editor-custom"
              />
            </div>
          </div>
        ) : (
          <iframe 
            src={previewUrl}
            className="w-full h-full border rounded-lg"
            onLoad={handleIframeLoad}
            title="Preview"
            style={{ 
              border: '1px solid #e5e7eb'
            }}
          />
        )}
      </div>
    </div>
  );
};

export default DynamicCodeRenderer;
