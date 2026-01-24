import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { IntegrationWithConfig, getApiKeyValue } from '../../services/api/integrationConfigService';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Eye, EyeOff, CheckCircle, KeyRound, Copy, Check, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'react-toastify';

interface IntegrationSetupTabProps {
  integration: IntegrationWithConfig;
  formValues: Record<string, string>;
  onFormChange: (key: string, value: string) => void;
  onOriginalValuesLoaded?: (values: Record<string, string>) => void;
}

export const IntegrationSetupTab: React.FC<IntegrationSetupTabProps> = ({
  integration,
  formValues,
  onFormChange,
  onOriginalValuesLoaded,
}) => {
  const { t } = useTranslation();
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [loadingKeys, setLoadingKeys] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [loadedKeys, setLoadedKeys] = useState<Record<string, boolean>>({});

  // Load configured key values on mount
  useEffect(() => {
    const loadConfiguredKeys = async () => {
      if (!integration.configuredKeys.length) return;

      const loadedValues: Record<string, string> = {};

      for (const keyName of integration.configuredKeys) {
        // Only load if not already in formValues
        if (!formValues[keyName] && !loadedKeys[keyName]) {
          setLoadingKeys((prev) => ({ ...prev, [keyName]: true }));
          try {
            const value = await getApiKeyValue(integration.id, keyName);
            onFormChange(keyName, value);
            loadedValues[keyName] = value;
            setLoadedKeys((prev) => ({ ...prev, [keyName]: true }));
          } catch (error) {
            console.error(`Failed to load key ${keyName}:`, error);
          } finally {
            setLoadingKeys((prev) => ({ ...prev, [keyName]: false }));
          }
        }
      }

      // Notify parent of loaded original values
      if (Object.keys(loadedValues).length > 0 && onOriginalValuesLoaded) {
        onOriginalValuesLoaded(loadedValues);
      }
    };

    loadConfiguredKeys();
  }, [integration.id, integration.configuredKeys]);

  const toggleSecretVisibility = (keyName: string) => {
    setShowSecrets((prev) => ({ ...prev, [keyName]: !prev[keyName] }));
  };

  const handleCopyKey = async (keyName: string) => {
    const valueToCopy = formValues[keyName];

    if (!valueToCopy) {
      toast.warning(t('integrations.setup.noValueToCopy', 'No value to copy'));
      return;
    }

    try {
      await navigator.clipboard.writeText(valueToCopy);
      setCopiedKey(keyName);
      toast.success(t('integrations.setup.keyCopied', 'API key copied to clipboard'));
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (_error) {
      toast.error(t('integrations.setup.copyError', 'Failed to copy to clipboard'));
    }
  };

  const hasRequiredKeys =
    integration.requiredApiKeys && integration.requiredApiKeys.length > 0;

  if (!hasRequiredKeys) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5" />
            {t('integrations.setup.title', 'Configuration')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <p className="text-lg font-medium text-foreground mb-2">
              {t('integrations.setup.noConfigNeeded', 'No Configuration Required')}
            </p>
            <p>
              {t(
                'integrations.setup.readyToUse',
                'This integration is ready to use without any additional setup.'
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* API Keys Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5" />
            {t('integrations.setup.apiKeys', 'API Keys')}
          </CardTitle>
          <CardDescription>
            {t(
              'integrations.setup.apiKeysDescription',
              'Enter your API credentials to enable this integration.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {integration.requiredApiKeys?.map((keyDef) => {
            const isConfigured = integration.configuredKeys.includes(keyDef.key);
            const isSecret = keyDef.type === 'secret';
            const currentValue = formValues[keyDef.key] || '';
            const isLoading = loadingKeys[keyDef.key];
            const isVisible = showSecrets[keyDef.key];

            return (
              <div key={keyDef.key} className="space-y-2">
                <Label htmlFor={keyDef.key} className="flex items-center gap-2">
                  {keyDef.label}
                  {isConfigured && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {t('integrations.setup.configured', 'Configured')}
                    </span>
                  )}
                </Label>

                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-10 bg-muted rounded-md">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <Input
                        id={keyDef.key}
                        type={isSecret && !isVisible ? 'password' : 'text'}
                        value={currentValue}
                        onChange={(e) => onFormChange(keyDef.key, e.target.value)}
                        placeholder={keyDef.placeholder}
                        className="pr-10"
                      />
                    )}
                    {isSecret && !isLoading && (
                      <button
                        type="button"
                        onClick={() => toggleSecretVisibility(keyDef.key)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {isVisible ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                  {currentValue && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopyKey(keyDef.key)}
                      className="shrink-0"
                      title="Copy"
                    >
                      {copiedKey === keyDef.key ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
                {(keyDef.description || keyDef.helpUrl) && (
                  <p className="text-xs text-muted-foreground">
                    {keyDef.description}
                    {keyDef.helpUrl && (
                      <>
                        {keyDef.description && ' '}
                        <a
                          href={keyDef.helpUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {t('integrations.setup.getApiKey', 'Get API key')}
                        </a>
                      </>
                    )}
                  </p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Help text */}
      {!integration.configured && (
        <p className="text-sm text-muted-foreground">
          {t(
            'integrations.setup.configureFirst',
            'Enter your API keys and click "Save API Keys" to configure this integration.'
          )}
        </p>
      )}
    </div>
  );
};
