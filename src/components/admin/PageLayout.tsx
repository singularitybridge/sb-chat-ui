import React, { ReactNode } from 'react';
import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  /**
   * URL to navigate back to. If provided, shows a back button.
   */
  backUrl?: string;
  /**
   * Label for the back button (shown on mobile)
   */
  backLabel?: string;
}

interface PageLayoutProps {
  children: ReactNode;
  /**
   * Layout variant:
   * - 'card': Centered card with white background (for forms, tables, settings)
   * - 'full': Full width layout (for pages with sidebars like assistants, teams)
   */
  variant?: 'card' | 'full';
  /**
   * Optional header with title, description, and action button
   */
  header?: PageHeaderProps;
  /**
   * Additional class names for the container
   */
  className?: string;
  /**
   * Maximum width for card variant (default: none - fills available width)
   */
  maxWidth?: string;
}

/**
 * PageLayout - Consistent layout wrapper for admin pages
 *
 * Provides two layout variants:
 * 1. Card layout: Centered card with white background, max width, and rounded corners
 * 2. Full layout: Full width container for pages with custom layouts (sidebars, etc.)
 *
 * Both variants support an optional header with title, description, and action button.
 */
const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  variant = 'card',
  header,
  className,
  maxWidth = '',
}) => {
  const HeaderSection = header && (
    <div className="flex justify-between items-start mb-6">
      <div className="flex items-start gap-4">
        {header.backUrl && (
          <Link to={header.backUrl}>
            <Button variant="ghost" size="icon" className="shrink-0 mt-0.5">
              <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
            </Button>
          </Link>
        )}
        <div>
          <h1 className="text-2xl font-semibold mb-2">{header.title}</h1>
          {header.description && (
            <p className="text-muted-foreground">{header.description}</p>
          )}
        </div>
      </div>
      {header.action && (
        <div className="shrink-0">
          {header.action}
        </div>
      )}
    </div>
  );

  if (variant === 'full') {
    return (
      <div className={cn('flex justify-center h-full', className)}>
        <div className={cn('flex w-full', maxWidth)}>
          {HeaderSection}
          {children}
        </div>
      </div>
    );
  }

  // Card variant (default)
  return (
    <div className="h-full w-full flex justify-center">
      <div className={cn(
        'w-full bg-card rounded-2xl overflow-auto',
        maxWidth,
        className
      )}>
        <div className="p-6">
          {HeaderSection}
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * PageHeader - Standalone header component for pages that need custom layouts
 */
const PageHeader: React.FC<PageHeaderProps> = ({ title, description, action, backUrl }) => {
  return (
    <div className="flex justify-between items-start mb-6">
      <div className="flex items-start gap-4">
        {backUrl && (
          <Link to={backUrl}>
            <Button variant="ghost" size="icon" className="shrink-0 mt-0.5">
              <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
            </Button>
          </Link>
        )}
        <div>
          <h1 className="text-2xl font-semibold mb-2">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

export { PageLayout, PageHeader };
export type { PageLayoutProps, PageHeaderProps };
