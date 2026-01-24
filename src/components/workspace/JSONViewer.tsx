import React from 'react';

interface JSONViewerProps {
  content: string;
}

export const JSONViewer: React.FC<JSONViewerProps> = ({ content }) => {
  const syntaxHighlight = (json: string) => {
    try {
      // Try to parse and format JSON
      const obj = JSON.parse(json);
      json = JSON.stringify(obj, null, 2);
    } catch (_e) {
      // If parsing fails, use original content
    }

    // Syntax highlighting with colors
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = 'text-violet'; // numbers
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'text-primary font-medium'; // keys
          } else {
            cls = 'text-success-foreground'; // strings
          }
        } else if (/true|false/.test(match)) {
          cls = 'text-warning-foreground'; // booleans
        } else if (/null/.test(match)) {
          cls = 'text-destructive'; // null
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  };

  return (
    <div className="p-6">
      <pre className="text-sm bg-secondary rounded-lg p-4 overflow-auto border border-border">
        <code
          dangerouslySetInnerHTML={{
            __html: syntaxHighlight(content),
          }}
        />
      </pre>
    </div>
  );
};
