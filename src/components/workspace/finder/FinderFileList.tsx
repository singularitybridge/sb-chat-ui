import React, { useMemo } from 'react';
import { ChevronUp, ChevronDown, Folder } from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { FinderFileItem, SortColumn, SortDirection } from './finder-types';
import {
  getFileIcon,
  formatDate,
  formatFileSize,
  getFileKind,
  sortFiles,
  getChildrenAtPath,
} from './finder-types';

interface FinderFileListProps {
  tree: FinderFileItem[];
  currentPath: string;
  selectedFile: FinderFileItem | null;
  searchQuery: string;
  searchResults?: FinderFileItem[] | null;
  searchLoading?: boolean;
  onSelectFile: (file: FinderFileItem) => void;
  onOpenFile: (file: FinderFileItem) => void;
  onNavigateFolder: (path: string) => void;
}

export const FinderFileList: React.FC<FinderFileListProps> = ({
  tree,
  currentPath,
  selectedFile,
  searchQuery,
  searchResults,
  searchLoading,
  onSelectFile,
  onOpenFile,
  onNavigateFolder,
}) => {
  const [sortColumn, setSortColumn] = React.useState<SortColumn>('name');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('asc');

  const handleSort = (col: SortColumn) => {
    if (sortColumn === col) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  // Get items for current folder
  const rawItems = useMemo(
    () => getChildrenAtPath(tree, currentPath),
    [tree, currentPath]
  );

  // Filter by search: merge filename matches (first) with AI semantic results (deduplicated)
  // Search across the entire tree, not just the current folder
  const filtered = useMemo(() => {
    if (!searchQuery) return rawItems;

    // Client-side filename filter across FULL tree (global search)
    // Fuzzy multi-word: split query into words, match all against name or path
    // Also try concatenated (no spaces) to match "open claw" → "openclaw"
    const q = searchQuery.toLowerCase();
    const words = q.split(/\s+/).filter(Boolean);
    const joined = words.join(''); // "open claw" → "openclaw"
    const matchesQuery = (name: string, path: string) => {
      const n = name.toLowerCase();
      const p = path.toLowerCase();
      // Exact substring match on full query
      if (n.includes(q) || p.includes(q)) return true;
      // Concatenated words match (handles "open claw" → "openclaw")
      if (words.length > 1 && (n.includes(joined) || p.includes(joined))) return true;
      // All individual words appear in name or path
      if (words.length > 1 && words.every(w => n.includes(w) || p.includes(w))) return true;
      return false;
    };
    const flatten = (items: FinderFileItem[]): FinderFileItem[] => {
      const result: FinderFileItem[] = [];
      for (const item of items) {
        if (matchesQuery(item.name, item.path)) result.push(item);
        if (item.children) result.push(...flatten(item.children));
      }
      return result;
    };
    const filenameMatches = flatten(tree);

    // If no AI results, just return filename matches
    if (!searchResults) return filenameMatches;

    // Merge: filename matches first, then AI results (deduplicated by path)
    const seen = new Set(filenameMatches.map((f) => f.path));
    const aiOnly = searchResults.filter((r) => !seen.has(r.path));
    return [...filenameMatches, ...aiOnly];
  }, [tree, rawItems, searchQuery, searchResults]);

  // Sort — but skip when searching to preserve relevance order
  // (filename matches first, then AI results by score)
  const items = useMemo(
    () => searchQuery ? filtered : sortFiles(filtered, sortColumn, sortDirection),
    [filtered, sortColumn, sortDirection, searchQuery]
  );

  const isSearching = !!searchQuery;
  const totalItemCount = isSearching ? items.length : rawItems.length;

  return (
    <div className="flex-1 flex flex-col min-w-[280px] bg-white dark:bg-zinc-950 overflow-hidden">
      {/* Column Headers */}
      <div className="h-7 flex items-center border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
        <ColumnHeader
          label={isSearching ? 'Path' : 'Name'}
          column="name"
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          className="flex-1 min-w-0"
        />
        <ColumnHeader
          label="Date Modified"
          column="dateModified"
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          className="w-28 hidden md:flex"
        />
        {!isSearching && (
          <>
            <ColumnHeader
              label="Size"
              column="size"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
              className="w-20 hidden lg:flex"
            />
            <ColumnHeader
              label="Kind"
              column="kind"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
              className="w-24 hidden lg:flex"
            />
          </>
        )}
      </div>

      {/* File Rows */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
        {searchLoading ? (
          <div className="flex items-center justify-center h-32 gap-2 text-[13px] text-zinc-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400" />
            Searching...
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-[13px] text-zinc-400">
            {searchQuery ? 'No matching files' : 'This folder is empty'}
          </div>
        ) : (
          items.map((item, i) => (
            <FileRow
              key={item.path}
              item={item}
              isSelected={selectedFile?.path === item.path}
              isEven={i % 2 === 0}
              isSearching={isSearching}
              onClick={() => {
                if (item.type === 'folder') {
                  onNavigateFolder(item.path);
                } else {
                  onSelectFile(item);
                }
              }}
              onDoubleClick={() => {
                if (item.type === 'folder') {
                  onNavigateFolder(item.path);
                } else {
                  onOpenFile(item);
                }
              }}
            />
          ))
        )}
      </div>

      {/* Status Bar */}
      <div className="h-6 px-3 flex items-center border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
        <span className="text-[11px] text-zinc-400">
          {totalItemCount} item{totalItemCount !== 1 ? 's' : ''}
          {isSearching && searchResults && ' · AI search'}
        </span>
      </div>
    </div>
  );
};

// ── Sub-components ─────────────────────────────────────────────────

function ColumnHeader({
  label,
  column,
  sortColumn,
  sortDirection,
  onSort,
  className,
}: {
  label: string;
  column: SortColumn;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSort: (col: SortColumn) => void;
  className?: string;
}) {
  const isActive = sortColumn === column;

  return (
    <button
      onClick={() => onSort(column)}
      className={cn(
        'flex items-center gap-1 px-3 h-full text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors',
        className
      )}
    >
      <span>{label}</span>
      {isActive && (
        sortDirection === 'asc'
          ? <ChevronUp className="h-3 w-3" />
          : <ChevronDown className="h-3 w-3" />
      )}
    </button>
  );
}

function FileRow({
  item,
  isSelected,
  isEven,
  isSearching,
  onClick,
  onDoubleClick,
}: {
  item: FinderFileItem;
  isSelected: boolean;
  isEven: boolean;
  isSearching: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={cn(
        'h-7 flex items-center cursor-default select-none transition-colors',
        isSelected
          ? 'bg-zinc-200/50 dark:bg-zinc-800/50 ring-1 ring-inset ring-zinc-300/40 dark:ring-zinc-700/40'
          : isEven
            ? 'bg-zinc-50/50 dark:bg-zinc-800/20'
            : 'bg-transparent',
        !isSelected && 'hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40'
      )}
    >
      {/* Name / Path */}
      <div className="flex-1 flex items-center gap-2 px-3 min-w-0">
        <span className="shrink-0 text-zinc-400 dark:text-zinc-500">
          {item.type === 'folder'
            ? <Folder className="h-4 w-4" />
            : getFileIcon(item.extension)}
        </span>
        <span
          className={cn(
            'text-[13px] truncate',
            isSelected
              ? 'text-zinc-900 dark:text-zinc-100 font-medium'
              : 'text-zinc-900 dark:text-zinc-100'
          )}
        >
          {isSearching ? item.path : item.name}
        </span>
      </div>

      {/* Date Modified */}
      <div className="w-28 px-3 hidden md:block">
        <span className="text-[13px] text-zinc-500 truncate">
          {formatDate(item.updatedAt)}
        </span>
      </div>

      {!isSearching && (
        <>
          {/* Size */}
          <div className="w-20 px-3 hidden lg:block">
            <span className="text-[13px] text-zinc-500 truncate">
              {item.type === 'folder' ? '—' : formatFileSize(item.size)}
            </span>
          </div>

          {/* Kind */}
          <div className="w-24 px-3 hidden lg:block">
            <span className="text-[13px] text-zinc-500 truncate">
              {item.type === 'folder' ? 'Folder' : getFileKind(item.extension)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
