import React from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface ModelIndicatorProps {
  modelName: string;
  size?: 'small' | 'medium' | 'large';
  showBadge?: boolean;
  className?: string;
}

const ProviderIcon = ({ provider, size = 16 }: { provider: string, size?: number }) => {
  const iconMap: { [key: string]: string } = {
    openai: 'simple-icons:openai',
    gemini: 'simple-icons:googlegemini',
    anthropic: 'simple-icons:anthropic',
  };

  const icon = iconMap[provider];
  if (!icon) return null;

  return <Icon icon={icon} width={size} height={size} className="inline-block" />;
};

const getModelInfo = (modelName: string): { name: string, provider: string } => {
  if (!modelName) return { name: '', provider: '' };
  const lowerCaseModel = modelName.toLowerCase();

  let provider = '';
  let shortenedName = modelName;

  if (lowerCaseModel.includes('claude')) {
    provider = 'anthropic';
    const claudeMatch = lowerCaseModel.match(/claude-([\d.-]+)-(\w+)/);
    if (claudeMatch) {
      const version = claudeMatch[1].replace(/-/g, '.');
      const model = claudeMatch[2];
      if (model === 'haiku' || model === 'sonnet' || model === 'opus') {
        shortenedName = `${version}-${model}`;
      }
    }
  } else if (lowerCaseModel.startsWith('gpt-')) {
    provider = 'openai';
    shortenedName = modelName.substring(4);
  } else if (lowerCaseModel.startsWith('gemini-')) {
    provider = 'gemini';
    const parts = modelName.split('-');
    if (parts.length >= 3) {
      shortenedName = `${parts[1]}-${parts[2]}`;
    }
  } else if (lowerCaseModel.includes('o3-mini')) {
    provider = 'openai';
    shortenedName = 'o3-mini';
  }

  return { name: shortenedName, provider };
};

export const ModelIndicator: React.FC<ModelIndicatorProps> = ({
  modelName,
  size = 'medium',
  showBadge = true,
  className = ''
}) => {
  const modelInfo = getModelInfo(modelName);

  if (!modelInfo.name) return null;

  const sizeMap = {
    small: { icon: 12, text: 'text-[11px]', height: 'h-5', px: 'px-2' },
    medium: { icon: 14, text: 'text-xs', height: 'h-6', px: 'px-2.5' },
    large: { icon: 16, text: 'text-sm', height: 'h-7', px: 'px-3' }
  };

  const sizeConfig = sizeMap[size];

  if (showBadge) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full font-medium font-inter',
          'bg-foreground/10 text-foreground/80 border border-foreground/20',
          sizeConfig.text,
          sizeConfig.height,
          sizeConfig.px,
          className
        )}
      >
        <ProviderIcon provider={modelInfo.provider} size={sizeConfig.icon} />
        <span>{modelInfo.name}</span>
      </span>
    );
  }

  return (
    <div className={cn('flex items-center gap-1 text-muted-foreground', sizeConfig.text, className)}>
      <ProviderIcon provider={modelInfo.provider} size={sizeConfig.icon} />
      <span>{modelInfo.name}</span>
    </div>
  );
};
