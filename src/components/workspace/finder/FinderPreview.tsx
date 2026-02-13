import React from 'react';
import { RefreshCw, Share2, Trash2 } from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { FinderFileItem } from './finder-types';
import {
  getFileIcon,
  formatDate,
  formatFileSize,
  getFileKind,
} from './finder-types';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { JSONViewer } from '../JSONViewer';
import { WorkspaceWelcome } from './WorkspaceWelcome';

interface FinderPreviewProps {
  file: FinderFileItem | null;
  fileContent: string | null;
  isLoading: boolean;
  markdownViewMode: 'rendered' | 'raw';
  tree: FinderFileItem[];
  onWelcomeFileSelect: (file: FinderFileItem) => void;
  onReload: () => void;
  onDelete: () => void;
  onEmbed: () => void;
  onToggleMarkdownView: () => void;
  injectWorkspaceAPIToHTML: (html: string) => string;
}

export const FinderPreview: React.FC<FinderPreviewProps> = ({
  file,
  fileContent,
  isLoading,
  markdownViewMode,
  tree,
  onWelcomeFileSelect,
  onReload,
  onDelete,
  onEmbed,
  onToggleMarkdownView,
  injectWorkspaceAPIToHTML,
}) => {
  if (!file) {
    return <WorkspaceWelcome tree={tree} onSelectFile={onWelcomeFileSelect} />;
  }

  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(file.extension || '');
  const isMarkdown = file.extension === 'md' || file.extension === 'mdx';
  const isHTML = file.extension === 'html';
  const isJSON = file.extension === 'json';
  const canEmbed = isHTML || isMarkdown;

  return (
    <div className="w-full border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex flex-col overflow-hidden">
      {/* Header with icon + name */}
      <div className="px-4 pt-5 pb-3 flex flex-col items-center text-center border-b border-zinc-200 dark:border-zinc-800">
        <div className="w-12 h-12 flex items-center justify-center mb-2 text-zinc-400 dark:text-zinc-500">
          {isImage && fileContent ? (
            <img
              src={`data:image/${file.extension};base64,${fileContent}`}
              alt={file.name}
              className="w-12 h-12 object-cover rounded-md"
            />
          ) : (
            <div className="scale-[2.5]">{getFileIcon(file.extension)}</div>
          )}
        </div>
        <h4 className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-full">
          {file.name}
        </h4>
        <span className="text-[11px] text-zinc-400 mt-0.5">
          {getFileKind(file.extension)}
        </span>
      </div>

      {/* Metadata */}
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 space-y-1.5">
        <MetaRow label="Size" value={formatFileSize(file.size)} />
        <MetaRow label="Modified" value={formatDate(file.updatedAt)} />
        <MetaRow label="Created" value={formatDate(file.createdAt)} />
        <MetaRow label="Kind" value={getFileKind(file.extension)} />
        <MetaRow label="Path" value={file.path} />
      </div>

      {/* Content Preview */}
      <div className="flex-1 overflow-auto min-h-0 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-zinc-400" />
          </div>
        ) : fileContent ? (
          <div className="p-3">
            {isImage ? (
              <img
                src={`data:image/${file.extension};base64,${fileContent}`}
                alt={file.name}
                className="w-full h-auto rounded-md"
              />
            ) : isHTML ? (
              <iframe
                srcDoc={injectWorkspaceAPIToHTML(fileContent)}
                className="w-full h-48 border border-zinc-200 dark:border-zinc-700 rounded-md"
                sandbox="allow-scripts allow-forms allow-same-origin"
                title="Preview"
              />
            ) : isMarkdown ? (
              markdownViewMode === 'rendered' ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <MarkdownRenderer content={fileContent} />
                </div>
              ) : (
                <pre className="text-[11px] text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap font-mono">
                  {fileContent.slice(0, 2000)}
                </pre>
              )
            ) : isJSON ? (
              <div className="text-[11px]">
                <JSONViewer content={fileContent} />
              </div>
            ) : (
              <pre className="text-[11px] text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap font-mono">
                {fileContent.slice(0, 2000)}
              </pre>
            )}
          </div>
        ) : null}
      </div>

      {/* Action Buttons */}
      <div className="px-3 py-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5">
        {isMarkdown && (
          <ActionButton
            onClick={onToggleMarkdownView}
            label={markdownViewMode === 'rendered' ? 'Raw' : 'Rendered'}
          />
        )}
        <ActionButton onClick={onReload} icon={<RefreshCw className="h-3 w-3" />} label="Reload" loading={isLoading} />
        {canEmbed && (
          <ActionButton onClick={onEmbed} icon={<Share2 className="h-3 w-3" />} label="Embed" />
        )}
        <ActionButton
          onClick={onDelete}
          icon={<Trash2 className="h-3 w-3" />}
          label="Delete"
          variant="danger"
        />
      </div>
    </div>
  );
};

// ── Sub-components ─────────────────────────────────────────────────

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-[11px]">
      <span className="text-zinc-400 dark:text-zinc-500 w-16 shrink-0">{label}</span>
      <span className="text-zinc-700 dark:text-zinc-300 truncate">{value}</span>
    </div>
  );
}

function ActionButton({
  onClick,
  icon,
  label,
  variant = 'default',
  loading = false,
}: {
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
  variant?: 'default' | 'danger';
  loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn(
        'flex-1 flex items-center justify-center gap-1 py-1 rounded text-[11px] font-medium transition-colors disabled:opacity-50',
        variant === 'danger'
          ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
          : 'bg-zinc-200/60 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
      )}
    >
      {loading ? <RefreshCw className="h-3 w-3 animate-spin" /> : icon}
      {label}
    </button>
  );
}
