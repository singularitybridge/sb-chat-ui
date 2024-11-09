import axios from 'axios';
import { transform } from '@babel/standalone';
import React from 'react';
import 'katex/dist/katex.min.css';

export interface DynamicCodeResult {
  component: React.ReactElement | null;
  error: string | null;
}

export const fetchCodeFromStorage = async (documentId: string): Promise<string> => {
  try {
    const response = await axios.get(
      `https://storage.googleapis.com/sb-ai-experiments-files/${documentId}`,
      { responseType: 'text' }
    );
    return response.data;
  } catch (err) {
    console.error('Error fetching code:', err);
    throw new Error('Failed to load code from storage');
  }
};

export const renderDynamicComponent = (code: string): DynamicCodeResult => {
  try {
    // Transform JSX to JavaScript
    const transformed = transform(code, {
      presets: ['react'],
    }).code;

    // Create a new function that returns the component
    const ComponentFunction = new Function(
      'React',
      'useState',
      'InlineMath',
      `
      ${transformed}
      return DemoComponent;
      `
    );

    // Dynamically import KaTeX CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css';
    document.head.appendChild(link);

    // Mock InlineMath component if react-katex is not available
    const MockInlineMath = ({ math }: { math: string }) => React.createElement('span', {}, math);

    // Get the component
    const Component = ComponentFunction(React, React.useState, MockInlineMath);
    
    return {
      component: React.createElement(Component),
      error: null
    };
  } catch (err) {
    console.error('Error rendering dynamic code:', err);
    return {
      component: null,
      error: err instanceof Error ? err.message : 'Error rendering component'
    };
  }
};

// Example usage of the demo component:
export const demoFractionCode = `
function DemoComponent() {
  const [numerator, setNumerator] = useState('');
  const [denominator, setDenominator] = useState('');
  const [mixedNumber, setMixedNumber] = useState(null);

  const handleConvert = () => {
    const num = parseInt(numerator, 10);
    const denom = parseInt(denominator, 10);

    if (denom === 0) {
      alert('Denominator cannot be zero.');
      return;
    }

    const wholePart = Math.floor(num / denom);
    const remainder = num % denom;

    if (remainder === 0) {
      setMixedNumber(\`\${wholePart}\`);
    } else {
      setMixedNumber(\`\${wholePart} \\\\frac{\${Math.abs(remainder)}}{\${denom}}\`);
    }
  };

  return (
    <div>
      <h1>Convert Improper Fraction to Mixed Number</h1>
      <input
        type="number"
        value={numerator}
        onChange={(e) => setNumerator(e.target.value)}
        placeholder="Numerator"
      />
      <input
        type="number"
        value={denominator}
        onChange={(e) => setDenominator(e.target.value)}
        placeholder="Denominator"
      />
      <button onClick={handleConvert}>Convert</button>
      {mixedNumber !== null && (
        <h2>
          Result: <InlineMath math={mixedNumber} />
        </h2>
      )}
    </div>
  );
}
`;
