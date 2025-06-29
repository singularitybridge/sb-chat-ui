import React, { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { useRootStore } from '../../store/common/RootStoreContext';
import AdminPageContainer from '../../components/admin/AdminPageContainer';
import { Table } from '../../components/sb-core-ui-kit/Table';
import { IconButton } from '../../components/admin/IconButton';
import { emitter } from '../../services/mittEmitter';
import { EVENT_SHOW_ADD_API_KEY_MODAL } from '../../utils/eventNames';
import { apiKeysService } from '../../services/api/apiKeysService';
import { Trash2, Copy, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

interface ApiKey {
  id: string;
  name: string;
  permissions: string[];
  expiresAt: string;
  createdAt: string;
}

export const ApiKeysPage: React.FC = observer(() => {
  const { t } = useTranslation();
  const rootStore = useRootStore();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchApiKeys = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiKeysService.listApiKeys();
      setApiKeys(response.apiKeys);
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
      toast.error(t('apiKeys.fetchError'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  const handleDelete = async (apiKey: ApiKey) => {
    if (window.confirm(t('apiKeys.confirmDelete', { name: apiKey.name }))) {
      try {
        await apiKeysService.revokeApiKey(apiKey.id);
        toast.success(t('apiKeys.deleteSuccess'));
        fetchApiKeys();
      } catch (error) {
        console.error('Failed to delete API key:', error);
        toast.error(t('apiKeys.deleteError'));
      }
    }
  };

  const handleAddApiKey = () => {
    emitter.emit(EVENT_SHOW_ADD_API_KEY_MODAL, { onSuccess: fetchApiKeys });
  };

  const isExpiringSoon = (expiresAt: string) => {
    const expirationDate = new Date(expiresAt);
    const daysUntilExpiration = (expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiration < 30;
  };

  const headers = ['name', 'createdAt', 'expiresAt'];

  const Actions = (row: ApiKey) => {
    return (
      <div className="flex gap-2">
        {isExpiringSoon(row.expiresAt) && (
          <div className="text-orange-500" title={t('apiKeys.expiringSoon')}>
            <AlertCircle size={20} />
          </div>
        )}
        <IconButton
          icon={<Trash2 size={20} />}
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(row);
          }}
          title={t('apiKeys.delete')}
        />
      </div>
    );
  };

  const formatData = (keys: ApiKey[]) => {
    return keys.map(key => ({
      ...key,
      createdAt: format(new Date(key.createdAt), 'MMM dd, yyyy'),
      expiresAt: format(new Date(key.expiresAt), 'MMM dd, yyyy'),
    }));
  };

  return (
    <AdminPageContainer>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">{t('apiKeys.title')}</h1>
          <p className="text-gray-600">{t('apiKeys.description', 'Manage your API keys for programmatic access')}</p>
        </div>
        <button
          onClick={handleAddApiKey}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {t('apiKeys.createNew')}
        </button>
      </div>
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : apiKeys.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          <p>{t('apiKeys.noKeys')}</p>
          <p className="mt-2">{t('apiKeys.getStarted')}</p>
        </div>
      ) : (
        <Table
          headers={headers}
          data={formatData(apiKeys)}
          Page="ApiKeysPage"
          Actions={Actions}
        />
      )}
    </AdminPageContainer>
  );
});