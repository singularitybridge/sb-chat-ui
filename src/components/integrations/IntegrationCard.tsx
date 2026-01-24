import React from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Check, AlertCircle } from 'lucide-react';
import { IntegrationWithConfig } from '../../services/api/integrationConfigService';
import { IntegrationIcon } from './IntegrationIcon';
import { Badge } from '../ui/badge';

interface IntegrationCardProps {
  integration: IntegrationWithConfig;
  onClick?: () => void;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  onClick,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/admin/integrations/${integration.id}`);
    }
  };

  const hasRequiredKeys =
    integration.requiredApiKeys && integration.requiredApiKeys.length > 0;
  const isConfigured = integration.configured;

  const formatCategory = (category: string) => {
    return category
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div
      onClick={handleClick}
      className="group relative p-4 rounded-xl border border-border bg-card hover:bg-accent/50 cursor-pointer transition-all duration-200 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <IntegrationIcon
          integrationName={integration.name}
          icon={integration.icon}
          size="lg"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">
              {integration.displayName || integration.name}
            </h3>
            {hasRequiredKeys && (
              <div className="shrink-0">
                {isConfigured ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                )}
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {integration.description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
        <div className="flex items-center gap-2">
          {integration.category && (
            <Badge variant="secondary" className="text-xs">
              {formatCategory(integration.category)}
            </Badge>
          )}
        </div>
        {hasRequiredKeys && (
          <span className="text-xs text-muted-foreground">
            {isConfigured
              ? t('integrations.configured', 'Configured')
              : t('integrations.needsSetup', 'Needs setup')}
          </span>
        )}
      </div>
    </div>
  );
};
