import React, { useRef, useEffect } from 'react';
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import 'highlight.js/styles/panda-syntax-light.css';
import * as LucideIcons from 'lucide-react';

hljs.registerLanguage('json', json);

interface JsonViewerProps {
  data: any;
  maxHeight?: string;
  messageId?: string;
  input?: string;
  output?: string;
}

const formatJson = (obj: any, space: number = 2): string => {
  return JSON.stringify(obj, null, space);
};

export const JsonViewer: React.FC<JsonViewerProps> = ({ data, maxHeight = '120px', messageId, input, output }) => {
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

  const handleUpload = () => {
    console.log('Message ID:', messageId);
    console.log('Input:', input);
    console.log('Output:', output);
  };

  const formattedJson = formatJson(data);

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-accent transition-colors duration-200 z-10"
        title="Copy JSON"
      >
        <LucideIcons.Copy className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
      <button
        onClick={handleUpload}
        className="absolute top-2 right-10 p-1.5 rounded-full hover:bg-accent transition-colors duration-200 z-10"
        title="Upload/Save JSON"
      >
        <LucideIcons.Upload className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
      <div style={{ maxHeight, overflowY: 'auto', overflowX: 'auto' }} className="bg-secondary rounded" dir='ltr'>
        <pre ref={preRef} className="text-xs p-2 rounded mt-1 text-left whitespace-pre-wrap break-words">
          <code className="language-json">
            {formattedJson}
          </code>
        </pre>
      </div>
    </div>
  );
};