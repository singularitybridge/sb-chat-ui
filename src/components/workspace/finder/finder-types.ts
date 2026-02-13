import React from 'react';
import {
  FileText,
  Image as ImageIcon,
  FileJson,
  File,
  Folder,
  FileCode,
  FileSpreadsheet,
  FileArchive,
  Film,
  Music,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────

export interface FinderFileItem {
  name: string;
  path: string;
  type: 'file' | 'folder';
  extension?: string;
  size?: number;
  createdAt?: Date;
  updatedAt?: Date;
  children?: FinderFileItem[];
}

export type SortColumn = 'name' | 'dateModified' | 'size' | 'kind';
export type SortDirection = 'asc' | 'desc';

// ── Tree builder ───────────────────────────────────────────────────

export function buildFileTree(
  items: Array<{ path: string; metadata: any; size?: number }>
): FinderFileItem[] {
  const root: FinderFileItem = {
    name: '/',
    path: '/',
    type: 'folder',
    children: [],
  };

  const metadataMap = new Map<string, any>();
  items.forEach((item) => {
    const normalizedPath = item.path.startsWith('/') ? item.path : '/' + item.path;
    metadataMap.set(normalizedPath, { ...item.metadata, size: item.size ?? item.metadata?.size });
  });

  items.forEach((item) => {
    const { path } = item;
    const parts = path.split('/').filter(Boolean);
    let currentNode = root;

    parts.forEach((part, index) => {
      const currentPath = '/' + parts.slice(0, index + 1).join('/');
      const isFile = index === parts.length - 1;

      let child = currentNode.children?.find((c) => c.name === part);

      if (!child) {
        const extension =
          isFile && part.includes('.') ? part.split('.').pop()?.toLowerCase() : undefined;

        const metadata = metadataMap.get(currentPath);
        const updatedAt = metadata?.updatedAt ? new Date(metadata.updatedAt) : undefined;
        const createdAt = metadata?.createdAt ? new Date(metadata.createdAt) : undefined;
        const size = metadata?.size;

        child = {
          name: part,
          path: currentPath,
          type: isFile ? 'file' : 'folder',
          extension,
          children: isFile ? undefined : [],
          updatedAt,
          createdAt,
          size,
        };

        currentNode.children = currentNode.children || [];
        currentNode.children.push(child);
      }

      if (!isFile) {
        currentNode = child;
      }
    });
  });

  return root.children || [];
}

// ── Utilities ──────────────────────────────────────────────────────

const iconClass = 'h-4 w-4';

export function getFileIcon(extension?: string): React.ReactElement {
  switch (extension) {
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
      return React.createElement(ImageIcon, { className: iconClass });
    case 'json':
      return React.createElement(FileJson, { className: iconClass });
    case 'md':
    case 'mdx':
    case 'txt':
      return React.createElement(FileText, { className: iconClass });
    case 'html':
    case 'css':
    case 'js':
    case 'ts':
    case 'tsx':
    case 'jsx':
      return React.createElement(FileCode, { className: iconClass });
    case 'csv':
    case 'xlsx':
    case 'xls':
      return React.createElement(FileSpreadsheet, { className: iconClass });
    case 'zip':
    case 'tar':
    case 'gz':
      return React.createElement(FileArchive, { className: iconClass });
    case 'mp4':
    case 'mov':
    case 'avi':
    case 'webm':
      return React.createElement(Film, { className: iconClass });
    case 'mp3':
    case 'wav':
    case 'ogg':
      return React.createElement(Music, { className: iconClass });
    default:
      return React.createElement(File, { className: iconClass });
  }
}

export function getFolderIcon(): React.ReactElement {
  return React.createElement(Folder, { className: iconClass });
}

export function formatDate(date?: Date): string {
  if (!date) return '—';
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined,
  });
}

export function formatFileSize(bytes?: number): string {
  if (bytes == null || bytes === 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileKind(extension?: string): string {
  if (!extension) return 'Document';
  switch (extension) {
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
      return 'Image';
    case 'json':
      return 'JSON';
    case 'md':
      return 'Markdown';
    case 'mdx':
      return 'MDX';
    case 'html':
      return 'HTML';
    case 'css':
      return 'Stylesheet';
    case 'js':
    case 'jsx':
      return 'JavaScript';
    case 'ts':
    case 'tsx':
      return 'TypeScript';
    case 'txt':
      return 'Text';
    case 'csv':
      return 'CSV';
    case 'pdf':
      return 'PDF';
    case 'mp4':
    case 'mov':
    case 'webm':
      return 'Video';
    case 'mp3':
    case 'wav':
      return 'Audio';
    default:
      return extension.toUpperCase();
  }
}

// ── Sorting helper ─────────────────────────────────────────────────

export function sortFiles(
  items: FinderFileItem[],
  column: SortColumn,
  direction: SortDirection
): FinderFileItem[] {
  return [...items].sort((a, b) => {
    // Folders always first
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;

    let cmp = 0;
    switch (column) {
      case 'name':
        cmp = a.name.localeCompare(b.name, undefined, { numeric: true });
        break;
      case 'dateModified':
        cmp = (a.updatedAt?.getTime() || 0) - (b.updatedAt?.getTime() || 0);
        break;
      case 'size':
        cmp = (a.size || 0) - (b.size || 0);
        break;
      case 'kind':
        cmp = getFileKind(a.extension).localeCompare(getFileKind(b.extension));
        break;
    }
    return direction === 'asc' ? cmp : -cmp;
  });
}

// ── Flat list helpers ──────────────────────────────────────────────

/** Get direct children of a folder path from the full tree */
export function getChildrenAtPath(
  tree: FinderFileItem[],
  folderPath: string
): FinderFileItem[] {
  if (folderPath === '/') return tree;

  const parts = folderPath.split('/').filter(Boolean);
  let current = tree;

  for (const part of parts) {
    const folder = current.find((f) => f.name === part && f.type === 'folder');
    if (!folder?.children) return [];
    current = folder.children;
  }
  return current;
}

/** Collect all folders recursively (for sidebar tree) */
export function collectFolders(items: FinderFileItem[]): FinderFileItem[] {
  const folders: FinderFileItem[] = [];
  for (const item of items) {
    if (item.type === 'folder') {
      folders.push(item);
      if (item.children) {
        folders.push(...collectFolders(item.children));
      }
    }
  }
  return folders;
}

/** Count files recursively */
export function countFiles(items: FinderFileItem[]): number {
  return items.reduce((acc, item) => {
    if (item.type === 'file') return acc + 1;
    if (item.children) return acc + countFiles(item.children);
    return acc;
  }, 0);
}

/** Get top-level folders for Favorites */
export function getTopLevelFolders(tree: FinderFileItem[]): FinderFileItem[] {
  return tree.filter((item) => item.type === 'folder');
}
