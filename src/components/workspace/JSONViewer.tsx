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
    } catch (e) {
      // If parsing fails, use original content
    }

    // Syntax highlighting with colors
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = 'text-purple-600'; // numbers
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'text-blue-600 font-medium'; // keys
          } else {
            cls = 'text-green-600'; // strings
          }
        } else if (/true|false/.test(match)) {
          cls = 'text-orange-600'; // booleans
        } else if (/null/.test(match)) {
          cls = 'text-red-600'; // null
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  };

  return (
    <div className="p-6">
      <pre className="text-sm bg-gray-50 rounded-lg p-4 overflow-auto border border-gray-200">
        <code
          dangerouslySetInnerHTML={{
            __html: syntaxHighlight(content),
          }}
        />
      </pre>
    </div>
  );
};
