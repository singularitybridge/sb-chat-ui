/**
 * Base types for workspace reactive components
 */

/**
 * Base props shared by all reactive components
 */
export interface BaseReactiveProps {
  /** Data key for reactive binding */
  dataKey: string;
  /** CSS class name */
  className?: string;
}

/**
 * Props for components that execute AI agents
 */
export interface AgentExecutionProps {
  /** Agent name or ID to execute */
  agentName: string;
  /** Query/prompt to send to agent */
  query?: string;
  /** Optional session ID */
  sessionId?: string;
}

/**
 * Props for input components
 */
export interface InputComponentProps extends BaseReactiveProps, AgentExecutionProps {
  /** Placeholder text */
  placeholder?: string;
  /** Button text */
  buttonText?: string;
  /** Enable streaming responses */
  stream?: boolean;
}

/**
 * Props for display components
 */
export interface DisplayComponentProps extends BaseReactiveProps {
  /** Fallback content when no data */
  fallback?: React.ReactNode;
  /** Show loading state */
  showLoading?: boolean;
}

/**
 * Props for processing components
 */
export interface ProcessingComponentProps extends BaseReactiveProps, AgentExecutionProps {
  /** Output data key (where to store result) */
  outputKey: string;
  /** Auto-execute when input data changes */
  autoExecute?: boolean;
}

/**
 * Props for list components
 */
export interface ListComponentProps extends DisplayComponentProps {
  /** Item renderer function */
  renderItem?: (item: any, index: number) => React.ReactNode;
  /** Empty state message */
  emptyMessage?: string;
}

/**
 * Props for table components
 */
export interface TableComponentProps extends DisplayComponentProps {
  /** Column definitions */
  columns?: Array<{
    key: string;
    label: string;
    render?: (value: any, row: any) => React.ReactNode;
  }>;
}
