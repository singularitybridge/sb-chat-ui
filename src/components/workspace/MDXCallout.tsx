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
    className: 'border-blue-200 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-950/20',
    iconClassName: 'text-blue-600 dark:text-blue-400',
    titleClassName: 'text-blue-900 dark:text-blue-200',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-900/30 dark:bg-yellow-950/20',
    iconClassName: 'text-yellow-600 dark:text-yellow-400',
    titleClassName: 'text-yellow-900 dark:text-yellow-200',
  },
  danger: {
    icon: AlertCircle,
    className: 'border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/20',
    iconClassName: 'text-red-600 dark:text-red-400',
    titleClassName: 'text-red-900 dark:text-red-200',
  },
  success: {
    icon: CheckCircle,
    className: 'border-green-200 bg-green-50/50 dark:border-green-900/30 dark:bg-green-950/20',
    iconClassName: 'text-green-600 dark:text-green-400',
    titleClassName: 'text-green-900 dark:text-green-200',
  },
  tip: {
    icon: Lightbulb,
    className: 'border-purple-200 bg-purple-50/50 dark:border-purple-900/30 dark:bg-purple-950/20',
    iconClassName: 'text-purple-600 dark:text-purple-400',
    titleClassName: 'text-purple-900 dark:text-purple-200',
  },
  note: {
    icon: Zap,
    className: 'border-border bg-secondary/50 dark:border-border dark:bg-secondary/30',
    iconClassName: 'text-muted-foreground dark:text-muted-foreground',
    titleClassName: 'text-foreground dark:text-foreground',
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
        'my-6 flex gap-3 rounded-lg border p-4 transition-colors',
        config.className,
        className
      )}
    >
      <Icon className={cn('h-5 w-5 mt-0.5 shrink-0', config.iconClassName)} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        {title && (
          <div className={cn('font-semibold mb-1', config.titleClassName)}>
            {title}
          </div>
        )}
        <div className="text-sm leading-relaxed text-foreground/80 dark:text-foreground/80">
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
