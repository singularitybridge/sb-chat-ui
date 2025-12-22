import React from 'react';
import { useCompanyStore } from '../../../store/useCompanyStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { ICompany } from '../../../types/entities';
import {
  DynamicForm,
  FieldConfig,
  FormValues,
} from '../../../components/DynamicForm';
import { companyFieldConfigs } from '../../../store/fieldConfigs/companyFieldConfigs';
import { useTranslation } from 'react-i18next';

interface CompanyDetailsSectionProps {
  company: ICompany;
  onUpdate: () => Promise<void>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const CompanyDetailsSection: React.FC<CompanyDetailsSectionProps> = (
  { company, onUpdate, isLoading, setIsLoading }
) => {
  const { updateCompany, loadCompanies, refreshToken, getCompanyById } = useCompanyStore();
  const { loadUserSessionInfo } = useAuthStore();
  const { t } = useTranslation();

  const formFields: FieldConfig[] = companyFieldConfigs.map((config) => {
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

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);
    await updateCompany(company._id, values as unknown as ICompany);
    await loadCompanies();
    await onUpdate();
    await loadUserSessionInfo();
    setIsLoading(false);
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
        <p className="text-gray-600 mb-6">
          {t('EditCompanyPage.description')}
        </p>
      </div>

      <div className="max-w-2xl">
        <DynamicForm
          fields={formFields}
          formContext="EditCompanyPage"
          onSubmit={handleSubmit}
          refreshToken={handleRefreshToken}
          isLoading={isLoading}
          formType="update"
        />
      </div>
    </div>
  );
};

export { CompanyDetailsSection };
