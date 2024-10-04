import React, { useRef, useEffect } from 'react';
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import 'highlight.js/styles/panda-syntax-light.css';
import * as LucideIcons from 'lucide-react';

hljs.registerLanguage('json', json);

interface JsonViewerProps {
  data: any;
  maxHeight?: string;
}

const formatJson = (obj: any, space: number = 2): string => {
  return JSON.stringify(obj, null, space);
};

export const JsonViewer: React.FC<JsonViewerProps> = ({ data, maxHeight = '120px' }) => {
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (preRef.current) {
      hljs.highlightElement(preRef.current);
    }
  }, [data]);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      .then(() => {
        console.log('JSON copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy JSON: ', err);
      });
  };

  const formattedJson = formatJson(data);

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-700 transition-colors duration-200 z-10"
        title="Copy JSON"
      >
        <LucideIcons.Copy className="w-4 h-4 text-gray-300" />
      </button>
      <div style={{ maxHeight, overflowY: 'auto', overflowX: 'auto' }} className="bg-gray-800 rounded" dir='ltr'>
        <pre ref={preRef} className="text-xs p-2 rounded mt-1 text-left whitespace-pre-wrap break-words">
          <code className="language-json">
            {formattedJson}
          </code>
        </pre>
      </div>
    </div>
  );
};