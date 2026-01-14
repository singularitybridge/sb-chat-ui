import React, { useState } from 'react';
import { Database, Clock, User, AlertCircle, RefreshCw, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useWorkspaceDataStore } from '../../store/useWorkspaceDataStore';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

interface MemoryPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * MemoryPreviewDialog - Shows all data stored in workspace memory
 *
 * Displays key-value pairs from the workspace data store with metadata
 * including timestamps, source agents, loading states, and errors.
 */
export const MemoryPreviewDialog: React.FC<MemoryPreviewDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { dataStore, clearData, clearAll } = useWorkspaceDataStore();
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  const dataKeys = Object.keys(dataStore);
  const hasData = dataKeys.length > 0;

  const toggleExpand = (key: string) => {
    setExpandedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);

    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;

    return date.toLocaleString();
  };

  const formatDataValue = (data: any): string => {
    if (data === null || data === undefined) return 'null';
    if (typeof data === 'string') return data;
    if (typeof data === 'number' || typeof data === 'boolean') return String(data);

    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  const handleClearAll = () => {
    const confirmClear = window.confirm(
      'Are you sure you want to clear all memory data? This action cannot be undone.'
    );
    if (confirmClear) {
      clearAll();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Database className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-slate-900">Workspace Memory</DialogTitle>
                <p className="text-sm text-slate-500">
                  {hasData ? `${dataKeys.length} item${dataKeys.length === 1 ? '' : 's'} in memory` : 'No data stored'}
                </p>
              </div>
            </div>

            {hasData && (
              <Button
                onClick={handleClearAll}
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 flex-1 overflow-auto">
        {hasData ? (
          <div className="space-y-3">
            {dataKeys.map((key) => {
              const state = dataStore[key];
              const isExpanded = expandedKeys.has(key);

              return (
                <div
                  key={key}
                  className="border border-slate-200 rounded-lg overflow-hidden"
                >
                  {/* Memory Item Header */}
                  <div
                    className="p-4 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => toggleExpand(key)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <button className="mt-0.5 text-slate-400 hover:text-slate-600">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="default" className="font-mono text-xs">
                              {key}
                            </Badge>

                            {state.loading && (
                              <Badge variant="outline" className="text-primary border-primary/30 bg-primary/10">
                                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                Loading
                              </Badge>
                            )}

                            {state.error && (
                              <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Error
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            {state.source && (
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>{state.source}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatTimestamp(state.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearData(key);
                        }}
                        variant="ghost"
                        size="sm"
                        className="ml-2 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Memory Item Content (Expanded) */}
                  {isExpanded && (
                    <div className="p-4 bg-white border-t border-slate-200">
                      {state.error ? (
                        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded text-sm text-destructive">
                          <div className="font-medium mb-1">Error:</div>
                          <div className="font-mono text-xs">{state.error}</div>
                        </div>
                      ) : state.data ? (
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-slate-600 mb-2">Data:</div>
                          <pre className="p-3 bg-slate-50 rounded text-xs font-mono overflow-auto max-h-64 text-slate-800">
                            {formatDataValue(state.data)}
                          </pre>
                        </div>
                      ) : (
                        <div className="text-sm text-slate-400 italic">No data</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
              <Database className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="text-sm font-medium text-slate-900 mb-1">No memory data</h4>
            <p className="text-xs text-slate-500">
              Workspace memory is empty. Data will appear here when agents store results.
            </p>
          </div>
        )}
      </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Memory is cleared when you refresh the page
            </p>
            <Button onClick={() => onClose()} variant="outline" size="sm">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
