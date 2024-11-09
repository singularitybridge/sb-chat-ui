import axios from 'axios';
import { transform } from '@babel/standalone';
import React from 'react';
import { loadKatexResources } from '../utils/katexLoader';

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
    // Load KaTeX resources
    loadKatexResources();

    // Transform JSX to JavaScript
    const transformed = transform(code, {
      presets: ['react'],
    }).code;

    // Create a function that will render the math expression
    const createInlineMath = function() {
      function InlineMathComponent(props: { math: string }) {
        const containerRef = React.useRef<HTMLSpanElement>(null);
        
        React.useEffect(function() {
          if (containerRef.current && window.katex) {
            window.katex.render(props.math, containerRef.current, {
              throwOnError: false,
              displayMode: false
            });
          } else if (containerRef.current) {
            containerRef.current.textContent = props.math;
          }
        }, [props.math]);

        return React.createElement('span', { ref: containerRef });
      }

      InlineMathComponent.displayName = 'InlineMathComponent';
      return InlineMathComponent;
    };

    // Create a new function that returns the component
    const ComponentFunction = new Function(
      'React',
      'useState',
      'useEffect',
      'useRef',
      'InlineMath',
      `
      var createInlineMath = ${createInlineMath.toString()};
      var InlineMathComponent = createInlineMath();
      ${transformed}
      return DemoComponent;
      `
    );

    // Get the component
    const Component = ComponentFunction(
      React,
      React.useState,
      React.useEffect,
      React.useRef,
      createInlineMath()
    );
    
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
