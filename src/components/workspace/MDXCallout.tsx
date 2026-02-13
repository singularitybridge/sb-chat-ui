import React from 'react';
import { Info, AlertTriangle, AlertCircle, CheckCircle, Lightbulb, Zap } from 'lucide-react';
import { cn } from '../../utils/cn';

interface CalloutProps {
  type?: 'info' | 'warning' | 'danger' | 'success' | 'tip' | 'note';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const calloutConfig = {
  info: {
    icon: Info,
    className: 'border-l-zinc-300 bg-zinc-50 dark:border-l-zinc-600 dark:bg-[rgba(24,24,27,0.3)]',
    iconClassName: 'text-zinc-400 dark:text-zinc-500',
    titleClassName: 'text-zinc-700 dark:text-zinc-300',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-l-[#f59e0b] bg-[hsl(45_93%_97%)] dark:border-l-[#f59e0b] dark:bg-[hsl(45_30%_8%)]',
    iconClassName: 'text-zinc-400 dark:text-zinc-500',
    titleClassName: 'text-zinc-700 dark:text-zinc-300',
  },
  danger: {
    icon: AlertCircle,
    className: 'border-l-[#ef4444] bg-[hsl(0_93%_97%)] dark:border-l-[#ef4444] dark:bg-[hsl(0_30%_8%)]',
    iconClassName: 'text-zinc-400 dark:text-zinc-500',
    titleClassName: 'text-zinc-700 dark:text-zinc-300',
  },
  success: {
    icon: CheckCircle,
    className: 'border-l-[#22c55e] bg-[hsl(142_76%_97%)] dark:border-l-[#22c55e] dark:bg-[hsl(142_30%_8%)]',
    iconClassName: 'text-zinc-400 dark:text-zinc-500',
    titleClassName: 'text-zinc-700 dark:text-zinc-300',
  },
  tip: {
    icon: Lightbulb,
    className: 'border-l-purple-400 bg-purple-50/50 dark:border-l-purple-400 dark:bg-purple-950/20',
    iconClassName: 'text-zinc-400 dark:text-zinc-500',
    titleClassName: 'text-zinc-700 dark:text-zinc-300',
  },
  note: {
    icon: Zap,
    className: 'border-l-zinc-300 bg-zinc-50 dark:border-l-zinc-600 dark:bg-[rgba(24,24,27,0.3)]',
    iconClassName: 'text-zinc-400 dark:text-zinc-500',
    titleClassName: 'text-zinc-700 dark:text-zinc-300',
  },
};

export const MDXCallout: React.FC<CalloutProps> = ({
  type = 'info',
  title,
  children,
  className,
}) => {
  const config = calloutConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'my-6 flex gap-3 rounded-none rounded-r border-0 border-l-2 p-4 transition-colors',
        config.className,
        className
      )}
    >
      <Icon className={cn('h-5 w-5 mt-0.5 shrink-0', config.iconClassName)} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        {title && (
          <div className={cn('font-medium mb-1', config.titleClassName)}>
            {title}
          </div>
        )}
        <div className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {children}
        </div>
      </div>
    </div>
  );
};

// Individual callout components for easier usage in MDX
export const InfoCallout: React.FC<Omit<CalloutProps, 'type'>> = (props) => (
  <MDXCallout type="info" {...props} />
);

export const WarningCallout: React.FC<Omit<CalloutProps, 'type'>> = (props) => (
  <MDXCallout type="warning" {...props} />
);

export const DangerCallout: React.FC<Omit<CalloutProps, 'type'>> = (props) => (
  <MDXCallout type="danger" {...props} />
);

export const SuccessCallout: React.FC<Omit<CalloutProps, 'type'>> = (props) => (
  <MDXCallout type="success" {...props} />
);

export const TipCallout: React.FC<Omit<CalloutProps, 'type'>> = (props) => (
  <MDXCallout type="tip" {...props} />
);

export const NoteCallout: React.FC<Omit<CalloutProps, 'type'>> = (props) => (
  <MDXCallout type="note" {...props} />
);
