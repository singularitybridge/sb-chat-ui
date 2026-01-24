import React, { useEffect, useState, useMemo } from 'react';
import {
  FileText,
  Image as ImageIcon,
  FileJson,
  File,
  Folder,
  Search,
  Sparkles,
  Calendar,
  Type
} from 'lucide-react';
import { listWorkspaceItems } from '../../services/api/workspaceService';

interface WorkspaceFileExplorerProps {
  agentId?: string;
  agentName?: string;
  sessionId?: string;
  scope?: 'company' | 'session' | 'agent' | 'team';
  selectedPath?: string | null; // Currently selected file path
  onFileSelect: (path: string, content: string, type: string) => void;
  onFileDeleted?: () => void; // Callback when file is deleted
}

interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'folder';
  extension?: string;
  updatedAt?: Date;
  children?: FileItem[];
}

type SortBy = 'name' | 'date';
type SortDirection = 'asc' | 'desc';

export const WorkspaceFileExplorer: React.FC<WorkspaceFileExplorerProps> = ({
  agentId,
  agentName: _agentName,
  sessionId,
  scope = 'agent',
  selectedPath,
  onFileSelect,
  onFileDeleted: _onFileDeleted
}) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(selectedPath || null);
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Sync internal state with prop
  useEffect(() => {
    if (selectedPath !== undefined) {
      setSelectedFile(selectedPath);
    }
  }, [selectedPath]);

  useEffect(() => {
    loadFiles();
  }, [agentId, sessionId, scope]);

  // Build tree structure from items with metadata
  const buildFileTree = (items: Array<{ path: string; metadata: any }>): FileItem[] => {
    const root: FileItem = {
      name: '/',
      path: '/',
      type: 'folder',
      children: []
    };

    // Create a map for quick metadata lookup
    // Normalize paths by adding leading slash for consistent lookup
    const metadataMap = new Map<string, any>();
    items.forEach(item => {
      const normalizedPath = item.path.startsWith('/') ? item.path : '/' + item.path;
      metadataMap.set(normalizedPath, item.metadata);
    });

    items.forEach(item => {
      const { path } = item;
      const parts = path.split('/').filter(Boolean);
      let currentNode = root;

      parts.forEach((part, index) => {
        const currentPath = '/' + parts.slice(0, index + 1).join('/');
        const isFile = index === parts.length - 1;

        let child = currentNode.children?.find(c => c.name === part);

        if (!child) {
          const extension = isFile && part.includes('.')
            ? part.split('.').pop()?.toLowerCase()
            : undefined;

          // Get real timestamp from metadata
          const metadata = metadataMap.get(currentPath);
          const updatedAt = metadata?.updatedAt ? new Date(metadata.updatedAt) : undefined;

          child = {
            name: part,
            path: currentPath,
            type: isFile ? 'file' : 'folder',
            extension,
            children: isFile ? undefined : [],
            updatedAt
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
  };

  const loadFiles = async () => {
    try {
      setLoading(true);
      // Request with metadata to get real timestamps
      const response = await listWorkspaceItems(scope, '', agentId, sessionId, undefined, true);

      if (response.success) {
        // Use items with metadata if available, fallback to paths for backwards compatibility
        if (response.items && response.items.length > 0) {
          const tree = buildFileTree(response.items);
          setFiles(tree);
        } else if (response.paths) {
          // Fallback for old API without metadata
          const tree = buildFileTree(response.paths.map(path => ({ path, metadata: {} })));
          setFiles(tree);
        }
      }
    } catch (error) {
      console.error('Failed to load workspace files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = (file: FileItem) => {
    // Only handle file clicks, ignore folder clicks
    if (file.type === 'folder') {
      return;
    }

    // Just update selection and notify parent
    // Parent will handle navigation and file loading
    setSelectedFile(file.path);
    const fileType = file.extension || 'text';
    onFileSelect(file.path, '', fileType); // Pass empty content, parent will load it
  };

  const handleSortChange = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDirection('asc');
    }
  };

  // Sort items recursively
  const sortItems = (items: FileItem[]): FileItem[] => {
    const sorted = [...items].sort((a, b) => {
      // Folders first, then files
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }

      if (sortBy === 'name') {
        const comparison = a.name.localeCompare(b.name, undefined, { numeric: true });
        return sortDirection === 'asc' ? comparison : -comparison;
      } else {
        const aDate = a.updatedAt?.getTime() || 0;
        const bDate = b.updatedAt?.getTime() || 0;
        const comparison = aDate - bDate;
        return sortDirection === 'asc' ? comparison : -comparison;
      }
    });

    return sorted.map(item => ({
      ...item,
      children: item.children ? sortItems(item.children) : undefined
    }));
  };

  // Filter and sort files
  const processedFiles = useMemo(() => {
    let result = files;

    // Filter by search query
    if (searchQuery) {
      const filterTree = (items: FileItem[]): FileItem[] => {
        return items.reduce<FileItem[]>((acc, item) => {
          if (item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            acc.push(item);
          } else if (item.children) {
            const filteredChildren = filterTree(item.children);
            if (filteredChildren.length > 0) {
              acc.push({ ...item, children: filteredChildren });
            }
          }
          return acc;
        }, []);
      };
      result = filterTree(result);
    }

    // Sort
    result = sortItems(result);

    return result;
  }, [files, searchQuery, sortBy, sortDirection]);

  const getFileIcon = (extension?: string) => {
    const iconClass = 'h-4 w-4';

    switch (extension) {
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
      case 'webp':
        return <ImageIcon className={iconClass} />;
      case 'json':
        return <FileJson className={iconClass} />;
      case 'md':
      case 'mdx':
      case 'txt':
      case 'html':
        return <FileText className={iconClass} />;
      default:
        return <File className={iconClass} />;
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Recursive tree renderer - folders always open
  const renderTreeItem = (item: FileItem, level: number = 0) => {
    const isSelected = selectedFile === item.path;

    return (
      <div key={item.path}>
        {item.type === 'folder' ? (
          // Folder header (non-clickable)
          <>
            <div
              className="flex items-center gap-2 px-3 py-1 text-muted-foreground"
              style={{ paddingLeft: `${level * 16 + 12}px` }}
            >
              <Folder className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium uppercase tracking-wide">{item.name}</span>
              {item.children && (
                <span className="text-[10px] text-muted-foreground">({item.children.length})</span>
              )}
            </div>
            {/* Always render children */}
            {item.children && (
              <div>
                {item.children.map(child => renderTreeItem(child, level + 1))}
              </div>
            )}
          </>
        ) : (
          // File item (clickable)
          <button
            onClick={() => handleFileClick(item)}
            className={`
              w-full flex items-center gap-2 px-3 py-1.5 text-left
              transition-all duration-150
              ${isSelected
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-accent text-foreground'
              }
            `}
            style={{ paddingLeft: `${level * 16 + 12}px` }}
          >
            <div className={`
              shrink-0
              ${isSelected ? 'text-primary' : 'text-muted-foreground'}
            `}>
              {getFileIcon(item.extension)}
            </div>
            <span className="flex-1 text-sm truncate">{item.name}</span>
            <span className="text-xs text-muted-foreground shrink-0">{formatDate(item.updatedAt)}</span>
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-muted-foreground mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // Count total files recursively
  const countFiles = (items: FileItem[]): number => {
    return items.reduce((acc, item) => {
      if (item.type === 'file') {
        return acc + 1;
      } else if (item.children) {
        return acc + countFiles(item.children);
      }
      return acc;
    }, 0);
  };

  const _totalFiles = countFiles(files);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Search and Sort Controls */}
      <div className="px-4 py-4 border-b border-border">
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-ring focus:border-transparent bg-secondary"
          />
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Sort:</span>
          <button
            onClick={() => handleSortChange('name')}
            className={`
              px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all
              ${sortBy === 'name'
                ? 'bg-primary/10 text-primary shadow-sm'
                : 'text-muted-foreground hover:bg-accent'
              }
            `}
          >
            <Type className="h-3.5 w-3.5" />
            Name
            {sortBy === 'name' && (
              <span className="text-xs ml-0.5">{sortDirection === 'asc' ? '↑' : '↓'}</span>
            )}
          </button>
          <button
            onClick={() => handleSortChange('date')}
            className={`
              px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all
              ${sortBy === 'date'
                ? 'bg-primary/10 text-primary shadow-sm'
                : 'text-muted-foreground hover:bg-accent'
              }
            `}
          >
            <Calendar className="h-3.5 w-3.5" />
            Date
            {sortBy === 'date' && (
              <span className="text-xs ml-0.5">{sortDirection === 'asc' ? '↑' : '↓'}</span>
            )}
          </button>
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto">
        {processedFiles.length === 0 && !searchQuery ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="p-4 bg-secondary rounded-full mb-4">
              <Sparkles className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No files yet</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              The AI agent can create and manage files in this workspace
            </p>
          </div>
        ) : processedFiles.length === 0 && searchQuery ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="p-4 bg-secondary rounded-full mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No results found</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Try a different search term
            </p>
          </div>
        ) : (
          <div className="py-1">
            {processedFiles.map(item => renderTreeItem(item, 0))}
          </div>
        )}
      </div>
    </div>
  );
};
