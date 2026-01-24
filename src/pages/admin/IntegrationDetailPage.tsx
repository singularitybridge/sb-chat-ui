import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useIntegrationStore } from '../../store/useIntegrationStore';
import { IntegrationSetupTab } from '../../components/integrations/IntegrationSetupTab';
import { IntegrationCapabilitiesTab } from '../../components/integrations/IntegrationCapabilitiesTab';
import { IntegrationIcon } from '../../components/integrations/IntegrationIcon';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import LoadingButton from '../../components/core/LoadingButton';
import { ArrowLeft, Check, AlertCircle, Play, Save, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { ApiKeyInput, testIntegrationConnection } from '../../services/api/integrationConfigService';

const IntegrationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    integrationsLoaded,
    isLoading,
    loadIntegrations,
    getIntegrationById,
    saveConfig,
    deleteConfig,
  } = useIntegrationStore();

  const [activeTab, setActiveTab] = useState<'setup' | 'capabilities'>('setup');
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [originalValues, setOriginalValues] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!integrationsLoaded) {
      loadIntegrations();
    }
  }, [integrationsLoaded, loadIntegrations]);

  const integration = id ? getIntegrationById(id) : null;

  // Initialize form values when integration loads
  useEffect(() => {
    if (integration) {
      const initialValues: Record<string, string> = {};
      integration.requiredApiKeys?.forEach((key) => {
        initialValues[key.key] = '';
      });
      setFormValues(initialValues);
    }
  }, [integration?.id]);

  if (isLoading && !integrationsLoaded) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!integration) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">
          {t('integrations.notFound', 'Integration not found')}
        </p>
        <Button variant="outline" onClick={() => navigate('/admin/integrations')}>
          {t('integrations.backToList', 'Back to Integrations')}
        </Button>
      </div>
    );
  }

  const hasRequiredKeys =
    integration.requiredApiKeys && integration.requiredApiKeys.length > 0;

  // Check if any form values differ from original loaded values
  const hasChanges = Object.entries(formValues).some(([key, value]) => {
    const original = originalValues[key] || '';
    return value.trim() !== original.trim();
  });

  const formatCategory = (category: string) => {
    return category
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleFormChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleOriginalValuesLoaded = (values: Record<string, string>) => {
    setOriginalValues((prev) => ({ ...prev, ...values }));
  };

  const handleSave = async () => {
    const apiKeys: ApiKeyInput[] = [];
    for (const [key, value] of Object.entries(formValues)) {
      if (value.trim()) {
        apiKeys.push({ key, value: value.trim() });
      }
    }

    if (apiKeys.length === 0) {
      toast.warning(t('integrations.noKeysToSave', 'No API keys to save'));
      return;
    }

    setIsSaving(true);
    try {
      await saveConfig(integration.id, apiKeys);
      toast.success(t('integrations.saveSuccess', 'API keys saved successfully'));
      // Update original values to match current form values (they are now the "saved" state)
      setOriginalValues({ ...formValues });
    } catch (_error) {
      toast.error(t('integrations.saveError', 'Failed to save API keys'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    // Build API keys from current form values
    const apiKeys: ApiKeyInput[] = [];
    for (const [key, value] of Object.entries(formValues)) {
      if (value.trim()) {
        apiKeys.push({ key, value: value.trim() });
      }
    }

    // Check if we have any keys to test (either from form or saved)
    if (apiKeys.length === 0 && !integration.configured) {
      toast.warning(t('integrations.testMissingKeys', 'Please enter API keys to test.'));
      return;
    }

    setIsTesting(true);
    try {
      // Pass current form values to test with (may include unsaved changes)
      const result = await testIntegrationConnection(
        integration.id,
        apiKeys.length > 0 ? apiKeys : undefined
      );

      if (result.success) {
        toast.success(result.message || t('integrations.testSuccess', 'Connection test successful!'));
      } else {
        toast.error(result.error || t('integrations.testFailed', 'Connection test failed.'));
      }
    } catch (_error) {
      toast.error(t('integrations.testFailed', 'Connection test failed. Please check your credentials.'));
    } finally {
      setIsTesting(false);
    }
  };

  const handleDelete = async () => {
    setIsSaving(true);
    try {
      await deleteConfig(integration.id);
      setDeleteDialogOpen(false);
      // Clear form and original values after deletion
      const clearedValues: Record<string, string> = {};
      integration.requiredApiKeys?.forEach((key) => {
        clearedValues[key.key] = '';
      });
      setFormValues(clearedValues);
      setOriginalValues({});
      toast.success(t('integrations.deleteSuccess', 'Configuration removed'));
    } catch (_error) {
      toast.error(t('integrations.deleteError', 'Failed to remove configuration'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="h-full w-full flex justify-center">
        <div className="w-full bg-card rounded-2xl flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="shrink-0 px-6 pt-6 pb-4 border-b border-border/50 bg-card">
            <div className="flex items-start justify-between gap-4">
              {/* Left side: Back button + Title */}
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <Link to="/admin/integrations">
                  <Button variant="ghost" size="icon" className="shrink-0 mt-1">
                    <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
                  </Button>
                </Link>
                <div className="flex items-center gap-4 min-w-0">
                  <IntegrationIcon
                    integrationName={integration.name}
                    icon={integration.icon}
                    size="lg"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-2xl font-semibold truncate">
                        {integration.displayName || integration.name}
                      </h1>
                      {hasRequiredKeys && (
                        <div className="shrink-0">
                          {integration.configured ? (
                            <Badge
                              variant="default"
                              className="bg-green-100 text-green-800 hover:bg-green-100"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              {t('integrations.configured', 'Configured')}
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-amber-100 text-amber-800 hover:bg-amber-100"
                            >
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {t('integrations.needsSetup', 'Needs setup')}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <p className="text-muted-foreground text-sm">
                        {integration.description}
                      </p>
                      {integration.category && (
                        <Badge variant="outline" className="text-xs">
                          {formatCategory(integration.category)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side: Tab Switcher */}
              <div className="shrink-0">
                <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                  <button
                    onClick={() => setActiveTab('setup')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'setup'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t('integrations.tabs.setup', 'Configuration')}
                  </button>
                  <button
                    onClick={() => setActiveTab('capabilities')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'capabilities'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t('integrations.tabs.capabilities', 'Capabilities')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {activeTab === 'setup' ? (
              <IntegrationSetupTab
                integration={integration}
                formValues={formValues}
                onFormChange={handleFormChange}
                onOriginalValuesLoaded={handleOriginalValuesLoaded}
              />
            ) : (
              <IntegrationCapabilitiesTab integration={integration} />
            )}
          </div>

          {/* Sticky Footer - Only show for setup tab with required keys */}
          {activeTab === 'setup' && hasRequiredKeys && (
            <div className="shrink-0 px-6 py-4 border-t border-border/50 bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <LoadingButton
                    onClick={handleSave}
                    isLoading={isSaving}
                    disabled={!hasChanges || isTesting}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {t('integrations.setup.saveKeys', 'Save API Keys')}
                  </LoadingButton>
                  <Button
                    variant="outline"
                    onClick={handleTest}
                    disabled={isTesting || (!integration.configured && !Object.values(formValues).some(v => v.trim()))}
                  >
                    {isTesting ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        {t('integrations.setup.testing', 'Testing...')}
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        {t('integrations.setup.runTest', 'Test Connection')}
                      </>
                    )}
                  </Button>
                </div>
                {integration.configured && (
                  <Button
                    variant="ghost"
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={isSaving}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t('integrations.setup.removeConfig', 'Remove Configuration')}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('integrations.deleteConfirmTitle', 'Remove Integration Configuration')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'integrations.deleteConfirmMessage',
                'This will remove all API keys and settings for this integration. Actions using this integration will stop working until reconfigured.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>
              {t('common.cancel', 'Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSaving}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('common.remove', 'Remove')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export { IntegrationDetailPage };
