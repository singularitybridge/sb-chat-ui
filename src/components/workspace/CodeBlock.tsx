import React from 'react';

interface CodeBlockProps {
  children: string;
  syntax?: string;
  showLineNumbers?: boolean;
}

/**
 * Custom code block component for MDX workspace files
 * Usage: <CodeBlock syntax="bash">your code here</CodeBlock>
 */
export const CodeBlock: React.FC<CodeBlockProps> = ({
  children,
  syntax = '',
  showLineNumbers = false
}) => {
  return (
    <div className="relative my-4">
      {syntax && (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-slate-700/80 text-slate-300 text-[10px] font-medium rounded font-['Inter',sans-serif] uppercase tracking-wide z-10">
          {syntax}
        </div>
      )}
      <pre
        className="bg-slate-900 rounded-lg p-3 overflow-x-auto border border-slate-800/50"
        style={{ margin: 0 }}
      >
        <code
          className="font-['JetBrains_Mono',monospace] text-[13px] leading-relaxed block"
          style={{
            color: '#f1f5f9',
            backgroundColor: 'transparent'
          }}
        >
          {children}
        </code>
      </pre>
    </div>
  );
};
