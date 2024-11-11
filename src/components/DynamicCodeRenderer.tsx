import React from 'react';
import Editor from '@monaco-editor/react';
import { fetchCodeFromStorage, renderDynamicComponent } from '../services/DynamicCodeService';
import { ErrorBoundary } from './ErrorBoundary';
import 'katex/dist/katex.min.css';
import '../styles/katex.css';

interface DynamicCodeRendererProps {
  code?: string;
  documentId?: string;
}

// Sample code for demonstration when no documentId is provided
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
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [currentCode, setCurrentCode] = React.useState(initialCode || sampleCode);
  const [renderedComponent, setRenderedComponent] = React.useState<React.ReactElement | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const loadCode = React.useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const code = await fetchCodeFromStorage(id);
      setCurrentCode(code);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load code');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (documentId) {
      loadCode(documentId);
    }
  }, [documentId, loadCode]);

  React.useEffect(() => {
    const { component, error } = renderDynamicComponent(currentCode);
    setRenderedComponent(component);
    setError(error);
  }, [currentCode]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCurrentCode(value);
    }
  };

  const renderControls = () => (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-gray-700 font-medium">
        Test - Canvas Editor
      </h3>
      <div className="inline-flex rounded-full border overflow-hidden text-sm">
        <button
          onClick={() => setIsEditMode(false)}
          className={`px-3 py-1.5 transition-all duration-200 ease-in-out ${
            !isEditMode 
              ? 'bg-gray-100 text-gray-800 shadow-sm' 
              : 'bg-white text-gray-500 hover:bg-gray-50'
          }`}
        >
          Preview
        </button>
        <button
          onClick={() => setIsEditMode(true)}
          className={`px-3 py-1.5 transition-all duration-200 ease-in-out ${
            isEditMode 
              ? 'bg-gray-100 text-gray-800 shadow-sm' 
              : 'bg-white text-gray-500 hover:bg-gray-50'
          }`}
        >
          Code
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
            <div className="text-gray-500">Loading code...</div>
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
                }}
              />
            </div>
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-red-600 font-semibold">Error</h3>
                <pre className="text-red-500 whitespace-pre-wrap font-mono text-sm mt-2">{error}</pre>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full border rounded-lg p-4 overflow-auto">
            <ErrorBoundary>
              {renderedComponent}
            </ErrorBoundary>
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-red-600 font-semibold">Error</h3>
                <pre className="text-red-500 whitespace-pre-wrap font-mono text-sm mt-2">{error}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicCodeRenderer;
