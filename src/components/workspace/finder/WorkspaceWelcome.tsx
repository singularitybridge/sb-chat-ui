import React, { useMemo } from 'react';
import { Clock, Sparkles, FileText } from 'lucide-react';
import type { FinderFileItem } from './finder-types';
import { getFileIcon, getFileKind } from './finder-types';

interface WorkspaceWelcomeProps {
  tree: FinderFileItem[];
  onSelectFile: (file: FinderFileItem) => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/** Flatten tree and return the N most recently updated files */
function getLatestFiles(tree: FinderFileItem[], limit = 10): FinderFileItem[] {
  const allFiles: FinderFileItem[] = [];

  const flatten = (items: FinderFileItem[]) => {
    for (const item of items) {
      if (item.type === 'file') allFiles.push(item);
      if (item.children) flatten(item.children);
    }
  };
  flatten(tree);

  return allFiles
    .sort((a, b) => {
      const aTime = (a.updatedAt || a.createdAt)?.getTime() || 0;
      const bTime = (b.updatedAt || b.createdAt)?.getTime() || 0;
      return bTime - aTime;
    })
    .slice(0, limit);
}

function getRelativeTime(date?: Date): string {
  if (!date) return '';
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** A file is "new" when its createdAt and updatedAt are within a minute of each other */
function isNewFile(item: FinderFileItem): boolean {
  if (!item.createdAt || !item.updatedAt) return false;
  return Math.abs(item.createdAt.getTime() - item.updatedAt.getTime()) < 60000;
}

export const WorkspaceWelcome: React.FC<WorkspaceWelcomeProps> = ({ tree, onSelectFile }) => {
  const latestFiles = useMemo(() => getLatestFiles(tree), [tree]);
  const greeting = getGreeting();

  return (
    <div className="w-full border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex flex-col overflow-hidden">
      {/* Greeting */}
      <div className="px-4 pt-6 pb-4 text-center">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 mb-3">
          <Sparkles className="h-5 w-5 text-violet-500" />
        </div>
        <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">
          {greeting}
        </h3>
        <p className="text-[12px] text-zinc-400 dark:text-zinc-500 mt-1">
          Here's what's been happening
        </p>
      </div>

      {/* Recent files list */}
      <div className="flex-1 overflow-auto px-3 pb-3">
        {latestFiles.length > 0 ? (
          <>
            <div className="flex items-center gap-1.5 px-1 pb-2">
              <Clock className="h-3 w-3 text-zinc-400" />
              <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                Recent
              </span>
            </div>

            <div className="space-y-0.5">
              {latestFiles.map((file) => {
                const isNew = isNewFile(file);
                const time = getRelativeTime(file.updatedAt || file.createdAt);

                return (
                  <button
                    key={file.path}
                    onClick={() => onSelectFile(file)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors group"
                  >
                    <div className="shrink-0 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                      {getFileIcon(file.extension)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] font-medium text-zinc-700 dark:text-zinc-200 truncate">
                          {file.name}
                        </span>
                        {isNew ? (
                          <span className="shrink-0 text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                            New
                          </span>
                        ) : (
                          <span className="shrink-0 text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            Updated
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-zinc-400 truncate">
                          {getFileKind(file.extension)}
                        </span>
                        {time && (
                          <>
                            <span className="text-[10px] text-zinc-300 dark:text-zinc-600">&middot;</span>
                            <span className="text-[10px] text-zinc-400 shrink-0">{time}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mb-2" />
            <p className="text-[12px] text-zinc-400">Your workspace is empty.</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Files will appear here as they're created.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
