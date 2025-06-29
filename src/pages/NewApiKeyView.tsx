import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { DynamicForm } from '../components/DynamicForm';
import { FieldConfig, FormValues } from '../components/DynamicForm';
import { getApiKeyFieldConfigs } from '../store/fieldConfigs/apiKeyFieldConfigs';
import { apiKeysService } from '../services/api/apiKeysService';
import { emitter } from '../services/mittEmitter';
import { EVENT_CLOSE_MODAL } from '../utils/eventNames';
import { toast } from 'react-toastify';
import { Copy, CheckCircle } from 'lucide-react';

export const NewApiKeyView: React.FC = observer(() => {
  const { t, i18n } = useTranslation();
  const [formFields, setFormFields] = useState<FieldConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadFieldConfigs = async () => {
      const configs = await getApiKeyFieldConfigs(i18n.language);
      setFormFields(configs);
    };
    loadFieldConfigs();
  }, [i18n.language]);

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const response = await apiKeysService.createApiKey({
        name: values.name as string,
        expiresInDays: parseInt(values.expiresInDays as string, 10),
      });
      
      setCreatedKey(response.apiKey.key!);
      toast.success(t('apiKeys.createSuccess'));
      
      // Emit success event with callback to refresh the list
      const eventData = (window as any).__apiKeyModalData;
      if (eventData?.onSuccess) {
        eventData.onSuccess();
      }
    } catch (error) {
      console.error('Failed to create API key:', error);
      toast.error(t('apiKeys.createError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyKey = async () => {
    if (createdKey) {
      try {
        await navigator.clipboard.writeText(createdKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success(t('apiKeys.copiedToClipboard'));
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        toast.error(t('apiKeys.copyError'));
      }
    }
  };

  const handleClose = () => {
    // If we created a key, trigger the success callback to refresh the list
    if (createdKey) {
      const eventData = (window as any).__apiKeyModalData;
      if (eventData?.onSuccess) {
        eventData.onSuccess();
      }
    }
    emitter.emit(EVENT_CLOSE_MODAL);
  };

  if (createdKey) {
    return (
      <div className="p-4">
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
            {t('apiKeys.createdSuccessfully')}
          </h3>
          <p className="text-sm text-green-700 dark:text-green-300">
            {t('apiKeys.saveKeyWarning')}
          </p>
        </div>
        
        <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-between">
          <code className="text-sm font-mono break-all text-gray-800 dark:text-gray-200">
            {createdKey}
          </code>
          <button
            onClick={handleCopyKey}
            className="ml-2 p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            title={t('apiKeys.copyToClipboard')}
          >
            {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
          </button>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {t('common.done')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <DynamicForm
      formContext="apiKeyFieldConfigs"
      fields={formFields}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      formType="create"
    />
  );
});