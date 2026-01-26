import React from 'react';
import { Icon } from '@iconify/react';
import { Badge } from './ui/badge';

interface ModelIndicatorProps {
  modelName: string;
  size?: 'small' | 'medium' | 'large';
  showBadge?: boolean;
  className?: string;
}

const ProviderIcon = ({ provider, size = 16 }: { provider: string, size?: number }) => {
  // Using simple-icons for all providers - they use currentColor
  // which properly adapts to light/dark mode
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
    small: { icon: 12, text: 'text-[10px]' },
    medium: { icon: 16, text: 'text-sm' },
    large: { icon: 20, text: 'text-base' }
  };

  const sizeConfig = sizeMap[size];

  if (showBadge) {
    return (
      <Badge
        variant="success"
        className={`${sizeConfig.text} ${className}`}
      >
        <ProviderIcon provider={modelInfo.provider} size={sizeConfig.icon} />
        <span>{modelInfo.name}</span>
      </Badge>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 ${sizeConfig.text} ${className}`}>
      <ProviderIcon provider={modelInfo.provider} size={sizeConfig.icon} />
      <span>{modelInfo.name}</span>
    </div>
  );
};