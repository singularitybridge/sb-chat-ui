import React from 'react';
import { transform } from '@babel/standalone';
import Editor from '@monaco-editor/react';

interface DynamicCodeRendererProps {
  code?: string;
}

// Sample code for demonstration
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

const DynamicCodeRenderer: React.FC<DynamicCodeRendererProps> = ({ code: initialCode }) => {
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [currentCode, setCurrentCode] = React.useState(initialCode || sampleCode);
  const [renderedComponent, setRenderedComponent] = React.useState<React.ReactNode | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const renderCode = React.useCallback(async (codeToRender: string) => {
    try {
      // Transform JSX to JavaScript
      const transformed = transform(codeToRender, {
        presets: ['react'],
      }).code;

      // Create a new function that returns the component
      const ComponentFunction = new Function(
        'React',
        'useState',
        `${transformed} return DemoComponent;`
      );

      // Get the component
      const Component = ComponentFunction(React, React.useState);
      
      setRenderedComponent(<Component />);
      setError(null);
    } catch (err) {
      console.error('Error rendering dynamic code:', err);
      setError(err instanceof Error ? err.message : 'Error rendering component');
      // Don't update renderedComponent on error
    }
  }, []);

  React.useEffect(() => {
    renderCode(currentCode);
  }, [currentCode, renderCode]);

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
        {isEditMode ? (
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
            {renderedComponent}
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
