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
    <div className="p-4 border rounded-lg bg-blue-50">
      <h2 className="text-xl font-bold mb-4">Dynamic Component Demo</h2>
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
  const [renderedCode, setRenderedCode] = React.useState(initialCode || sampleCode);
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
      setRenderedCode(codeToRender);
    } catch (err) {
      console.error('Error rendering dynamic code:', err);
      setError(err instanceof Error ? err.message : 'Error rendering component');
      // Don't update renderedComponent or renderedCode on error
    }
  }, []);

  React.useEffect(() => {
    renderCode(renderedCode);
  }, [renderedCode, renderCode]);

  const handleApplyChanges = () => {
    renderCode(currentCode);
  };

  const toggleEditMode = () => {
    setIsEditMode(prev => !prev);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCurrentCode(value);
    }
  };

  const renderControls = () => (
    <div className="flex gap-2 mb-4">
      <button
        onClick={toggleEditMode}
        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
      >
        {isEditMode ? 'View' : 'Edit'}
      </button>
      {isEditMode && (
        <button
          onClick={handleApplyChanges}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Apply Changes
        </button>
      )}
    </div>
  );

  return (
    <div className="dynamic-code-renderer space-y-4">
      {renderControls()}
      {isEditMode ? (
        <div className="space-y-4">
          <div className="border">
            <Editor
              height="400px"
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
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-red-600 font-semibold">Compilation Error</h3>
              <pre className="text-red-500 whitespace-pre-wrap font-mono text-sm mt-2">{error}</pre>
            </div>
          )}
        </div>
      ) : (
        <div>
          {renderedComponent}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-red-600 font-semibold">Compilation Error</h3>
              <pre className="text-red-500 whitespace-pre-wrap font-mono text-sm mt-2">{error}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DynamicCodeRenderer;
