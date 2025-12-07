import React from 'react';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../../store/common/RootStoreContext';
import { ICompany } from '../../../store/models/Company';
import {
  DynamicForm,
  FieldConfig,
  FormValues,
} from '../../../components/DynamicForm';
import { toJS } from 'mobx';
import { companyFieldConfigs } from '../../../store/fieldConfigs/companyFieldConfigs';
import { useTranslation } from 'react-i18next';

interface CompanyDetailsSectionProps {
  company: ICompany;
  onUpdate: () => Promise<void>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const CompanyDetailsSection: React.FC<CompanyDetailsSectionProps> = observer(
  ({ company, onUpdate, isLoading, setIsLoading }) => {
    const rootStore = useRootStore();
    const { t } = useTranslation();

    const formFields: FieldConfig[] = companyFieldConfigs.map((config) => {
      const fieldKeyString = String(config.key);
      let fieldValue;

      if (config.id === 'api_keys') {
        const companyApiKeys = company ? toJS(company.api_keys) || [] : [];
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
          ? toJS((company as any)[fieldKeyString])
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
      await rootStore.updateCompany(values as unknown as ICompany);
      await rootStore.loadCompanies();
      await onUpdate();
      await rootStore.authStore.loadUserSessionInfo();
      setIsLoading(false);
    };

    const handleRefreshToken = async () => {
      setIsLoading(true);
      const updatedCompany = await rootStore.refreshToken();
      if (updatedCompany) {
        localStorage.setItem('userToken', updatedCompany.token.value);
        await onUpdate();
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
  }
);

export { CompanyDetailsSection };
