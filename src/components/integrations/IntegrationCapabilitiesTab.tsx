import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IntegrationWithConfig } from '../../services/api/integrationConfigService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Zap,
  Search,
  ChevronDown,
  ChevronRight,
  Code,
  AlertCircle,
} from 'lucide-react';

interface IntegrationCapabilitiesTabProps {
  integration: IntegrationWithConfig;
}

export const IntegrationCapabilitiesTab: React.FC<IntegrationCapabilitiesTabProps> = ({
  integration,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAction, setExpandedAction] = useState<string | null>(null);

  const filteredActions = integration.actions.filter((action) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      action.actionTitle.toLowerCase().includes(query) ||
      action.description.toLowerCase().includes(query)
    );
  });

  const toggleAction = (actionId: string) => {
    setExpandedAction(expandedAction === actionId ? null : actionId);
  };

  if (integration.actions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            {t('integrations.capabilities.title', 'Capabilities')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>
              {t(
                'integrations.capabilities.noActions',
                'No actions available for this integration.'
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Actions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                {t('integrations.capabilities.title', 'Available Actions')}
              </CardTitle>
              <CardDescription>
                {t(
                  'integrations.capabilities.description',
                  'These actions can be used by AI assistants when this integration is configured.'
                )}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-sm">
              {integration.actions.length}{' '}
              {t('integrations.capabilities.actions', 'actions')}
            </Badge>
          </div>

          {/* Search */}
          {integration.actions.length > 5 && (
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('integrations.capabilities.searchActions', 'Search actions...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredActions.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>
                  {t('integrations.capabilities.noResults', 'No actions match your search.')}
                </p>
              </div>
            ) : (
              filteredActions.map((action) => {
                const isExpanded = expandedAction === action.id;
                // Type assertion for parameters since it comes from API
                const actionWithParams = action as typeof action & { parameters?: object };

                return (
                  <div key={action.id} className="border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleAction(action.id)}
                      className="w-full flex items-center justify-between p-3 bg-card hover:bg-accent/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                          <Code className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{action.actionTitle}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {action.description}
                          </p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-4 bg-muted/50 border-t border-border space-y-3">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                            {t('integrations.capabilities.actionId', 'Action ID')}
                          </p>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {action.id}
                          </code>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                            {t('integrations.capabilities.descriptionLabel', 'Description')}
                          </p>
                          <p className="text-sm text-foreground">{action.description}</p>
                        </div>
                        {actionWithParams.parameters && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                              {t('integrations.capabilities.parameters', 'Parameters')}
                            </p>
                            <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                              {JSON.stringify(actionWithParams.parameters, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
