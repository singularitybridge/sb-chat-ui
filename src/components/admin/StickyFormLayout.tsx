import React, { ReactNode } from 'react';
import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

interface StickyFormLayoutProps {
  children: ReactNode;
  /**
   * Page title displayed in the sticky header
   */
  title: string;
  /**
   * Optional subtitle/description displayed below the title
   */
  subtitle?: string;
  /**
   * URL to navigate back to. If provided, shows a back button.
   */
  backUrl?: string;
  /**
   * Optional action element displayed in the header (e.g., a button)
   */
  headerAction?: ReactNode;
  /**
   * Footer content (typically action buttons)
   */
  footer?: ReactNode;
  /**
   * Additional class names for the outer container
   */
  className?: string;
  /**
   * Additional class names for the content area
   */
  contentClassName?: string;
}

/**
 * StickyFormLayout - A layout with sticky header and footer
 *
 * Provides a consistent layout pattern with:
 * - Sticky header with title, subtitle, and optional back button
 * - Scrollable content area
 * - Sticky footer for action buttons
 *
 * Ideal for form pages, settings pages, and detail views.
 */
const StickyFormLayout: React.FC<StickyFormLayoutProps> = ({
  children,
  title,
  subtitle,
  backUrl,
  headerAction,
  footer,
  className,
  contentClassName,
}) => {
  return (
    <div className={cn('h-full w-full flex justify-center', className)}>
      <div className="w-full bg-card rounded-2xl flex flex-col h-full overflow-hidden">
        {/* Sticky Header */}
        <div className="shrink-0 px-6 pt-6 pb-4 border-b border-border/50 bg-card">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {backUrl && (
                <Link to={backUrl}>
                  <Button variant="ghost" size="icon" className="shrink-0 mt-0.5">
                    <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
                  </Button>
                </Link>
              )}
              <div>
                <h1 className="text-2xl font-semibold">{title}</h1>
                {subtitle && (
                  <p className="text-muted-foreground mt-0.5">{subtitle}</p>
                )}
              </div>
            </div>
            {headerAction && (
              <div className="shrink-0">
                {headerAction}
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className={cn('flex-1 overflow-y-auto px-6 py-6', contentClassName)}>
          {children}
        </div>

        {/* Sticky Footer */}
        {footer && (
          <div className="shrink-0 px-6 py-4 border-t border-border/50 bg-card">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export { StickyFormLayout };
export type { StickyFormLayoutProps };
