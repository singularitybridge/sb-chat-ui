import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { FinderFileItem } from './finder-types';
import { getFileIcon, getFileKind } from './finder-types';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { JSONViewer } from '../JSONViewer';

interface FinderFileModalProps {
  file: FinderFileItem;
  content: string;
  onClose: () => void;
  injectWorkspaceAPIToHTML: (html: string) => string;
}

export const FinderFileModal: React.FC<FinderFileModalProps> = ({
  file,
  content,
  onClose,
  injectWorkspaceAPIToHTML,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(file.extension || '');
  const isMarkdown = file.extension === 'md' || file.extension === 'mdx';
  const isHTML = file.extension === 'html';
  const isJSON = file.extension === 'json';

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-[90vw] max-w-5xl h-[85vh] bg-white dark:bg-zinc-900 rounded-xl shadow-2xl flex flex-col overflow-hidden font-['IBM_Plex_Sans',sans-serif]">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <span className="text-zinc-400 dark:text-zinc-500">
            {getFileIcon(file.extension)}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {file.name}
            </h3>
            <p className="text-[11px] text-zinc-400 truncate">
              {file.path} &middot; {getFileKind(file.extension)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
          {isImage ? (
            <div className="flex items-center justify-center h-full">
              <img
                src={`data:image/${file.extension};base64,${content}`}
                alt={file.name}
                className="max-w-full max-h-full object-contain rounded-md"
              />
            </div>
          ) : isHTML ? (
            <iframe
              srcDoc={injectWorkspaceAPIToHTML(content)}
              className="w-full h-full border border-zinc-200 dark:border-zinc-700 rounded-md"
              sandbox="allow-scripts allow-forms allow-same-origin"
              title="Preview"
            />
          ) : isMarkdown ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <MarkdownRenderer content={content} />
            </div>
          ) : isJSON ? (
            <JSONViewer content={content} />
          ) : (
            <pre className="text-[13px] text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
              {content}
            </pre>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
