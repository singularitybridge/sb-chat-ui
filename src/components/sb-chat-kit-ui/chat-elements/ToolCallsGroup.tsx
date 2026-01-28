import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { ActionExecutionMessage } from './ActionExecutionMessage';

interface ToolCall {
  id: string;
  messageId: string;
  status: 'started' | 'completed' | 'failed';
  actionId: string;
  serviceName: string;
  actionTitle: string;
  actionDescription: string;
  icon: string;
  originalActionId: string;
}

interface ToolCallsGroupProps {
  toolCalls: ToolCall[];
  maxVisible?: number;
}

const ToolCallsGroup: React.FC<ToolCallsGroupProps> = ({
  toolCalls,
  maxVisible = 3
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasMore = toolCalls.length > maxVisible;
  const visibleCalls = isExpanded ? toolCalls : toolCalls.slice(0, maxVisible);
  const hiddenCount = toolCalls.length - maxVisible;

  // Count statuses
  const completedCount = toolCalls.filter(c => c.status === 'completed').length;
  const failedCount = toolCalls.filter(c => c.status === 'failed').length;
  const runningCount = toolCalls.filter(c => c.status === 'started').length;

  return (
    <div className="space-y-0.5">
      {visibleCalls.map((call) => (
        <ActionExecutionMessage
          key={call.id}
          messageId={call.messageId}
          status={call.status}
          actionId={call.actionId}
          serviceName={call.serviceName}
          actionTitle={call.actionTitle}
          actionDescription={call.actionDescription}
          icon={call.icon}
          originalActionId={call.originalActionId}
        />
      ))}

      {hasMore && !isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-1.5 ml-11 py-1 px-2 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronRight className="w-3 h-3" />
          <span>
            +{hiddenCount} more
            {runningCount > 0 && (
              <span className="ml-1 text-blue-500">({runningCount} running)</span>
            )}
            {completedCount > 0 && (
              <span className="ml-1 text-emerald-500">({completedCount} done)</span>
            )}
            {failedCount > 0 && (
              <span className="ml-1 text-red-500">({failedCount} failed)</span>
            )}
          </span>
        </button>
      )}

      {hasMore && isExpanded && (
        <button
          onClick={() => setIsExpanded(false)}
          className="flex items-center gap-1.5 ml-11 py-1 px-2 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown className="w-3 h-3" />
          <span>Show less</span>
        </button>
      )}
    </div>
  );
};

export { ToolCallsGroup };
export type { ToolCall };
