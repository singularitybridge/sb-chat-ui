import React from 'react';
import { transform } from '@babel/standalone';

interface DynamicCodeRendererProps {
  code?: string;
}

const DynamicCodeRenderer: React.FC<DynamicCodeRendererProps> = ({ code }) => {
  const [renderedComponent, setRenderedComponent] = React.useState<React.ReactNode | null>(null);
  const [error, setError] = React.useState<string | null>(null);

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
    }
  `;

  React.useEffect(() => {
    const renderCode = async () => {
      try {
        const codeToRender = code || sampleCode;
        
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
        setRenderedComponent(null);
      }
    };

    renderCode();
  }, [code]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-600 font-semibold">Error Rendering Component</h3>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="dynamic-code-renderer">
      {renderedComponent}
    </div>
  );
};

export default DynamicCodeRenderer;
