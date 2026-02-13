import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  PanelRight,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { cn } from '../../../utils/cn';

interface FinderToolbarProps {
  currentPath: string;
  canGoBack: boolean;
  canGoForward: boolean;
  searchQuery: string;
  showPreview: boolean;
  isAISearch?: boolean;
  isSearchLoading?: boolean;
  onGoBack: () => void;
  onGoForward: () => void;
  onNavigateFolder: (path: string) => void;
  onSearchChange: (query: string) => void;
  onTogglePreview: () => void;
}

export const FinderToolbar: React.FC<FinderToolbarProps> = ({
  currentPath,
  canGoBack,
  canGoForward,
  searchQuery,
  showPreview,
  isAISearch,
  isSearchLoading,
  onGoBack,
  onGoForward,
  onNavigateFolder,
  onSearchChange,
  onTogglePreview,
}) => {
  const pathSegments = currentPath === '/'
    ? [{ label: 'Workspace', path: '/' }]
    : [
        { label: 'Workspace', path: '/' },
        ...currentPath
          .split('/')
          .filter(Boolean)
          .map((seg, i, arr) => ({
            label: seg,
            path: '/' + arr.slice(0, i + 1).join('/'),
          })),
      ];

  return (
    <div className="h-11 px-3 flex items-center gap-2 bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 shrink-0">
      {/* Back / Forward */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={onGoBack}
          disabled={!canGoBack}
          className="p-1 rounded hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 disabled:opacity-30 disabled:cursor-default transition-colors"
          title="Back"
        >
          <ChevronLeft className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
        </button>
        <button
          onClick={onGoForward}
          disabled={!canGoForward}
          className="p-1 rounded hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 disabled:opacity-30 disabled:cursor-default transition-colors"
          title="Forward"
        >
          <ChevronRight className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
        </button>
      </div>

      {/* Breadcrumb */}
      <div className="flex-1 flex items-center gap-1 min-w-0 overflow-hidden">
        {pathSegments.map((seg, i) => (
          <React.Fragment key={seg.path}>
            {i > 0 && (
              <span className="text-zinc-300 dark:text-zinc-600 text-[13px] shrink-0">/</span>
            )}
            <button
              onClick={() => onNavigateFolder(seg.path)}
              className={cn(
                'text-[13px] truncate shrink-0 max-w-[120px] hover:underline transition-colors',
                i === pathSegments.length - 1
                  ? 'font-semibold text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-500 dark:text-zinc-400'
              )}
            >
              {seg.label}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-48">
        {isSearchLoading ? (
          <Loader2 className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-500 animate-spin" />
        ) : isAISearch ? (
          <Sparkles className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-500" />
        ) : (
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
        )}
        <input
          type="text"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            'w-full pl-7 pr-2 py-1 text-[12px] rounded-md border text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition-colors',
            isAISearch
              ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50'
              : 'bg-zinc-200/60 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700'
          )}
        />
      </div>

      {/* Toggle buttons */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={onTogglePreview}
          className={cn(
            'p-1.5 rounded transition-colors',
            showPreview
              ? 'bg-zinc-200/80 dark:bg-zinc-700/80 text-zinc-900 dark:text-zinc-100'
              : 'text-zinc-500 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
          )}
          title={showPreview ? 'Hide Preview' : 'Show Preview'}
        >
          <PanelRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
