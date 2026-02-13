import React from 'react';
import { Folder, ChevronRight } from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { FinderFileItem } from './finder-types';
import { getTopLevelFolders } from './finder-types';

interface FinderSidebarProps {
  tree: FinderFileItem[];
  currentPath: string;
  expandedFolders: Set<string>;
  onNavigateFolder: (path: string) => void;
  onToggleFolder: (path: string) => void;
}

export const FinderSidebar: React.FC<FinderSidebarProps> = ({
  tree,
  currentPath,
  expandedFolders,
  onNavigateFolder,
  onToggleFolder,
}) => {
  const topFolders = getTopLevelFolders(tree);

  return (
    <div className="w-52 shrink-0 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-xl border-r border-zinc-200 dark:border-zinc-800 flex flex-col select-none overflow-hidden">
      {/* Traffic Lights (decorative) */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF5F57' }} />
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FEBC2E' }} />
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#28C840' }} />
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
        {/* All Files */}
        <SidebarItem
          label="All Files"
          icon={<Folder className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />}
          active={currentPath === '/'}
          onClick={() => onNavigateFolder('/')}
        />

        {/* Folder Tree */}
        {topFolders.length > 0 && (
          <>
            <div className="mt-2" />
            <SectionLabel>Folders</SectionLabel>
            {topFolders.map((folder) => (
              <FolderTreeNode
                key={folder.path}
                folder={folder}
                currentPath={currentPath}
                expandedFolders={expandedFolders}
                depth={0}
                onNavigateFolder={onNavigateFolder}
                onToggleFolder={onToggleFolder}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

// ── Sub-components ─────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2 pt-2 pb-1 text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
      {children}
    </div>
  );
}

function SidebarItem({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2 px-2 py-1 rounded-md text-[13px] transition-colors',
        active
          ? 'bg-zinc-200/60 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 font-medium'
          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/40 dark:hover:bg-zinc-800/40'
      )}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}

function FolderTreeNode({
  folder,
  currentPath,
  expandedFolders,
  depth,
  onNavigateFolder,
  onToggleFolder,
}: {
  folder: FinderFileItem;
  currentPath: string;
  expandedFolders: Set<string>;
  depth: number;
  onNavigateFolder: (path: string) => void;
  onToggleFolder: (path: string) => void;
}) {
  const subFolders = folder.children?.filter((c) => c.type === 'folder') || [];
  const isExpanded = expandedFolders.has(folder.path);
  const isActive = currentPath === folder.path;
  const hasSubFolders = subFolders.length > 0;

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-1 py-0.5 rounded-md cursor-pointer transition-colors text-[13px]',
          isActive
            ? 'bg-zinc-200/60 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 font-medium'
            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/40 dark:hover:bg-zinc-800/40'
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {/* Disclosure triangle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (hasSubFolders) onToggleFolder(folder.path);
          }}
          className={cn(
            'w-4 h-4 flex items-center justify-center shrink-0 transition-transform',
            !hasSubFolders && 'invisible'
          )}
        >
          <ChevronRight
            className={cn(
              'h-3 w-3 text-zinc-400 transition-transform',
              isExpanded && 'rotate-90'
            )}
          />
        </button>

        <button
          onClick={() => onNavigateFolder(folder.path)}
          className="flex items-center gap-1.5 flex-1 min-w-0 py-0.5"
        >
          <Folder className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
          <span className="truncate">{folder.name}</span>
        </button>
      </div>

      {isExpanded &&
        subFolders.map((sub) => (
          <FolderTreeNode
            key={sub.path}
            folder={sub}
            currentPath={currentPath}
            expandedFolders={expandedFolders}
            depth={depth + 1}
            onNavigateFolder={onNavigateFolder}
            onToggleFolder={onToggleFolder}
          />
        ))}
    </div>
  );
}
