import React, { useState, useMemo } from 'react';
import { useCompanyStore } from '../../../store/useCompanyStore';
import { ICompany } from '../../../types/entities';
import {
  DynamicForm,
  FieldConfig,
  FormValues,
} from '../../../components/DynamicForm';
import { companyFieldConfigs } from '../../../store/fieldConfigs/companyFieldConfigs';
import { useTranslation } from 'react-i18next';
import { emitter } from '../../../services/mittEmitter';
import { EVENT_SHOW_NOTIFICATION } from '../../../utils/eventNames';

interface CompanyDetailsSectionProps {
  company: ICompany;
  onUpdate: () => Promise<void>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const CompanyDetailsSection: React.FC<CompanyDetailsSectionProps> = (
  { company, onUpdate, isLoading, setIsLoading }
) => {
  const { updateCompany, refreshToken, getCompanyById } = useCompanyStore();
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);

  const formFields: FieldConfig[] = useMemo(() => {
    return companyFieldConfigs.map((config) => {
      const fieldKeyString = String(config.key);
      let fieldValue;

      if (config.id === 'api_keys') {
        const companyApiKeys = company ? company.api_keys || [] : [];
        const companyApiKeysMap = new Map(
          companyApiKeys.map((k) => [k.key, k.value])
        );

        fieldValue = (config.value as { key: string; value: string }[]).map(
          (defaultApiKey) => ({
            ...defaultApiKey,
            value:
              companyApiKeysMap.get(defaultApiKey.key) || defaultApiKey.value,
          })
        );
      } else {
        fieldValue = company
          ? (company as any)[fieldKeyString]
          : config.value;
      }

      return {
        ...config,
        value: fieldValue,
        options: (config as any).options || [],
      } as FieldConfig;
    });
  }, [company]);

  const handleSubmit = async (values: FormValues) => {
    setIsSaving(true);
    try {
      await updateCompany(company._id, values as unknown as ICompany);
      emitter.emit(EVENT_SHOW_NOTIFICATION, {
        message: t('EditCompanyPage.emitterMessage'),
        type: 'success',
      });
    } catch (error) {
      console.error('[CompanyDetailsSection] Error:', error);
      emitter.emit(EVENT_SHOW_NOTIFICATION, {
        message: t('common.saveFailed'),
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefreshToken = async () => {
    setIsLoading(true);
    try {
      await refreshToken(company._id);
      const updatedCompany = getCompanyById(company._id);
      if (updatedCompany?.token?.value) {
        localStorage.setItem('userToken', updatedCompany.token.value);
        await onUpdate();
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">
          {t('EditCompanyPage.title')}
        </h1>
        <p className="text-muted-foreground mb-6">
          {t('EditCompanyPage.description')}
        </p>
      </div>

      <div className="max-w-2xl">
        <DynamicForm
          fields={formFields}
          formContext="EditCompanyPage"
          onSubmit={handleSubmit}
          refreshToken={handleRefreshToken}
          isLoading={isSaving}
          formType="update"
        />
      </div>
    </div>
  );
};

export { CompanyDetailsSection };
