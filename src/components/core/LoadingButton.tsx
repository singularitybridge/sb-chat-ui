import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, buttonVariants } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type VariantProps } from 'class-variance-authority';

interface LoadingButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  isLoading: boolean;
  loadingText?: string;
  asChild?: boolean;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  loadingText,
  children,
  className,
  variant = 'default',
  size = 'default',
  disabled,
  ...props
}) => {
  const { t } = useTranslation();

  return (
    <Button
      variant={variant}
      size={size}
      disabled={isLoading || disabled}
      className={cn(className)}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin" />
          {loadingText || t('common.pleaseWait')}
        </>
      ) : (
        children
      )}
    </Button>
  );
};

export default LoadingButton;
