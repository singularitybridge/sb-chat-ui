import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { ChevronDown, ChevronRight, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { getMessageById } from '../../../services/api/assistantService';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ActionExecutionMessageProps {
  messageId: string;
  status: 'started' | 'completed' | 'failed';
  actionId: string;
  serviceName: string;
  actionTitle: string;
  actionDescription: string;
  icon: string;
  originalActionId: string;
}

interface FullMessageData {
  _id: string;
  data: {
    id: string;
    actionId: string;
    serviceName: string;
    actionTitle: string;
    actionDescription: string;
    icon: string;
    originalActionId: string;
    input?: any;
    output?: any;
    status: 'started' | 'completed' | 'failed';
  };
  sessionId: string;
  messageType: string;
  sender: string;
  timestamp: string;
}

const mapIconName = (iconName: string): keyof typeof LucideIcons => {
  const pascalCase = iconName.split(/[-_\s]+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('');
  const specialCases: { [key: string]: keyof typeof LucideIcons } = {
    'image': 'Image',
    'brain': 'Brain',
    'search': 'Search',
    'file': 'FileText',
    'database': 'Database',
    'calendar': 'Calendar',
    'clock': 'Clock',
  };
  return (specialCases[iconName] || pascalCase) as keyof typeof LucideIcons;
};

const ActionExecutionMessage: React.FC<ActionExecutionMessageProps> = ({
  messageId,
  status,
  serviceName,
  actionTitle,
  icon,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [fullMessageData, setFullMessageData] = useState<FullMessageData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mappedIconName = mapIconName(icon);
  const IconComponent = (LucideIcons[mappedIconName] || LucideIcons.Zap) as React.ComponentType<React.SVGProps<SVGSVGElement>>;

  const loadFullMessage = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMessageById(messageId);
      setFullMessageData(data);
    } catch (err) {
      setError('Failed to load');
      console.error('Error loading message details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async () => {
    if (!isExpanded && !fullMessageData) {
      await loadFullMessage();
    }
    setIsExpanded(!isExpanded);
  };

  const handleReload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await loadFullMessage();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Status dot colors
  const statusColors = {
    started: 'bg-blue-500',
    completed: 'bg-emerald-500',
    failed: 'bg-red-500',
  };

  return (
    <div className="mb-1.5 ml-9 overflow-hidden">
      {/* Header row */}
      <div
        className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg bg-muted/50 hover:bg-muted/70 cursor-pointer transition-colors group"
        onClick={handleToggle}
      >
        {/* Status dot */}
        <span className={cn('w-2 h-2 rounded-full shrink-0', statusColors[status])} />

        {/* Icon */}
        <IconComponent className="w-3.5 h-3.5 text-muted-foreground shrink-0" />

        {/* Title */}
        <span className="text-[12px] text-foreground truncate font-inter flex-1 min-w-0">
          {actionTitle}
        </span>

        {/* Service name */}
        <span className="text-[11px] text-muted-foreground font-inter shrink-0">
          {serviceName}
        </span>

        {/* Expand/Reload controls */}
        <div className="flex items-center gap-1 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
            onClick={handleReload}
          >
            <RefreshCw className={cn('w-3 h-3', isLoading && 'animate-spin')} />
          </Button>
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Expandable details - constrained width */}
      {isExpanded && (
        <div className="mt-1 ml-4 pl-3 border-l-2 border-border/50 py-2 overflow-hidden">
          {isLoading && (
            <div className="flex items-center gap-2 py-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-[12px]">Loading...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 py-2 text-red-500">
              <AlertCircle className="w-4 h-4" />
              <span className="text-[12px]">{error}</span>
              <button onClick={handleReload} className="text-[12px] underline">Retry</button>
            </div>
          )}

          {!isLoading && !error && fullMessageData && (
            <div className="space-y-3 overflow-hidden">
              {/* Info rows */}
              <div className="space-y-1.5">
                <InfoRow label="Action" value={fullMessageData.data.actionId} onCopy={copyToClipboard} />
                <InfoRow label="Status" value={fullMessageData.data.status} onCopy={copyToClipboard} />
              </div>

              {/* Input */}
              {fullMessageData.data.input && (
                <JsonBlock label="Input" data={fullMessageData.data.input} onCopy={copyToClipboard} />
              )}

              {/* Output */}
              {fullMessageData.data.output && (
                <JsonBlock label="Output" data={fullMessageData.data.output} onCopy={copyToClipboard} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Info row component
const InfoRow: React.FC<{
  label: string;
  value: string;
  onCopy: (text: string) => void;
}> = ({ label, value, onCopy }) => (
  <div className="flex items-center gap-3 group text-[12px] min-w-0">
    <span className="text-muted-foreground w-16 shrink-0">{label}</span>
    <span className="text-foreground truncate font-mono text-[11px] min-w-0">{value}</span>
    <button
      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity shrink-0"
      onClick={() => onCopy(value)}
    >
      <LucideIcons.Copy className="w-3 h-3" />
    </button>
  </div>
);

// JSON block component - with constrained width
const JsonBlock: React.FC<{
  label: string;
  data: any;
  onCopy: (text: string) => void;
}> = ({ label, data, onCopy }) => {
  const json = JSON.stringify(data, null, 2);
  return (
    <div className="space-y-1 overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
        <button
          className="text-muted-foreground hover:text-foreground text-[10px] flex items-center gap-1"
          onClick={() => onCopy(json)}
        >
          <LucideIcons.Copy className="w-3 h-3" />
          Copy
        </button>
      </div>
      <div className="rounded-lg bg-muted/50 border border-border/30 overflow-hidden">
        <pre className="text-[11px] p-3 overflow-x-auto max-h-[200px] overflow-y-auto font-mono text-foreground/80 leading-relaxed whitespace-pre-wrap break-all">
          {json}
        </pre>
      </div>
    </div>
  );
};

export { ActionExecutionMessage };
