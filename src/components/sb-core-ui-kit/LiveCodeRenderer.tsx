import React, { useMemo } from 'react';
import * as Babel from '@babel/standalone';

type Scope = Record<string, any>;

interface LiveCodeRendererProps {
  code: string;
  scope?: Scope;
  className?: string;
  showErrorsInline?: boolean;
}

/**
 * LiveCodeRenderer
 * Evaluates a React JSX code string into a ReactNode using @babel/standalone.
 * - Accepts either:
 *    1) A JSX expression: e.g. <div>...</div>
 *    2) An imperative body with a final return, wrapped as an IIFE: e.g.
 *       (() => { const x = 1; return <div />; })()
 * - Only identifiers provided in "scope" are available (plus React).
 */
const LiveCodeRenderer: React.FC<LiveCodeRendererProps> = ({
  code,
  scope = {},
  className = '',
  showErrorsInline = true,
}) => {
  const { element, error } = useMemo(() => {
    if (!code?.trim()) {
      return { element: null as React.ReactNode, error: null as Error | null };
    }

    try {
      const scopeKeys = Object.keys(scope);
      const scopeValues = scopeKeys.map((k) => scope[k]);
      const isExpression = /^\s*</.test(code.trim());

      // Wrap into a function that returns the rendered element
      const wrapper = `(function(React, ${scopeKeys.join(', ')}) { ${
        isExpression ? `return (${code});` : `return (function(){ ${code} })();`
      } })`;

      // Transform JSX to JS
      const transformed = Babel.transform(wrapper, {
        presets: ['react'],
        filename: 'live.jsx',
      });
      const compiled = transformed && typeof transformed.code === 'string' ? transformed.code : '';
      if (!compiled) {
        throw new Error('Babel transform failed to produce code');
      }

      // Evaluate to obtain the function, then invoke with React + scope values
       
      const fn = (0, eval)(compiled) as (...args: any[]) => React.ReactNode;
      const result = fn(React, ...scopeValues);

      return { element: result, error: null };
    } catch (e: any) {
      return { element: null as React.ReactNode, error: e };
    }
  }, [code, scope]);

  if (error) {
    if (showErrorsInline) {
      return (
        <div className={`rounded-md border border-red-300 bg-red-50 text-red-800 p-3 ${className}`}>
          <div className="font-mono text-xs whitespace-pre-wrap">{String(error?.message || error)}</div>
        </div>
      );
    }
    throw error;
  }

  return <div className={className}>{element}</div>;
};

export default LiveCodeRenderer;
