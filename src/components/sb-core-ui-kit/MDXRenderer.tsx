import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MDXRendererProps {
  content: string;
  className?: string;
}

const MDXRenderer: React.FC<MDXRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          code({ node: _node, className, children, ...props }: any) {
            const inline = !className;
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          // Style other markdown elements for theme support
          h1: ({ children }) => <h1 className="text-2xl font-bold text-foreground mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-semibold text-foreground mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-medium text-foreground mb-2">{children}</h3>,
          p: ({ children }) => <p className="text-foreground mb-3">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-inside text-foreground mb-3">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside text-foreground mb-3">{children}</ol>,
          li: ({ children }) => <li className="mb-1">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-border pl-4 italic text-muted-foreground my-3">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a href={href} className="text-primary hover:text-primary/80 underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          table: ({ children }) => (
            <table className="min-w-full divide-y divide-border mb-4">
              {children}
            </table>
          ),
          thead: ({ children }) => <thead className="bg-secondary">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-border">{children}</tbody>,
          tr: ({ children }) => <tr>{children}</tr>,
          th: ({ children }) => (
            <th className="px-3 py-2 text-left text-xs font-medium text-foreground uppercase tracking-wider">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-sm text-muted-foreground">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MDXRenderer;