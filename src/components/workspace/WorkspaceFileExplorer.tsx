import React, { useEffect, useState, useMemo } from 'react';
import {
  FileText,
  Image as ImageIcon,
  FileJson,
  File,
  Folder,
  Search,
  Bot,
  Sparkles,
  Calendar,
  Type
} from 'lucide-react';
import { listWorkspaceItems, getWorkspaceItem, WorkspaceGetResponse } from '../../services/api/workspaceService';

interface WorkspaceFileExplorerProps {
  agentId: string;
  agentName?: string;
  sessionId?: string;
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
  agentName,
  sessionId,
  selectedPath,
  onFileSelect,
  onFileDeleted
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
  }, [agentId, sessionId]);

  // Build tree structure from flat file paths
  const buildFileTree = (paths: string[]): FileItem[] => {
    const root: FileItem = {
      name: '/',
      path: '/',
      type: 'folder',
      children: []
    };

    paths.forEach(path => {
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

          child = {
            name: part,
            path: currentPath,
            type: isFile ? 'file' : 'folder',
            extension,
            children: isFile ? undefined : [],
            // Mock date - in real implementation this would come from API
            updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
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
      const response = await listWorkspaceItems('agent', '', agentId, sessionId);

      if (response.success && response.paths) {
        const tree = buildFileTree(response.paths);
        setFiles(tree);
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
    const iconClass = "h-4 w-4";

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
              className="flex items-center gap-2 px-3 py-1 text-gray-600"
              style={{ paddingLeft: `${level * 16 + 12}px` }}
            >
              <Folder className="h-4 w-4 text-gray-400" />
              <span className="text-xs font-medium uppercase tracking-wide">{item.name}</span>
              {item.children && (
                <span className="text-[10px] text-gray-400">({item.children.length})</span>
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
                ? 'bg-blue-50 text-blue-700'
                : 'hover:bg-gray-50 text-gray-700'
              }
            `}
            style={{ paddingLeft: `${level * 16 + 12}px` }}
          >
            <div className={`
              flex-shrink-0
              ${isSelected ? 'text-blue-600' : 'text-gray-400'}
            `}>
              {getFileIcon(item.extension)}
            </div>
            <span className="flex-1 text-sm truncate">{item.name}</span>
            <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(item.updatedAt)}</span>
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto"></div>
          <p className="text-sm text-gray-500">Loading workspace...</p>
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

  const totalFiles = countFiles(files);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Search and Sort Controls */}
      <div className="px-4 py-4 border-b border-gray-100">
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
          />
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Sort:</span>
          <button
            onClick={() => handleSortChange('name')}
            className={`
              px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all
              ${sortBy === 'name'
                ? 'bg-blue-50 text-blue-700 shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
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
                ? 'bg-blue-50 text-blue-700 shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
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
            <div className="p-4 bg-gray-50 rounded-full mb-4">
              <Sparkles className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">No files yet</p>
            <p className="text-xs text-gray-500 max-w-xs">
              The AI agent can create and manage files in this workspace
            </p>
          </div>
        ) : processedFiles.length === 0 && searchQuery ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="p-4 bg-gray-50 rounded-full mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">No results found</p>
            <p className="text-xs text-gray-500 max-w-xs">
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
