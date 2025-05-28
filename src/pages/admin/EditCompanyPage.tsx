import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../store/common/RootStoreContext';
import { ICompany } from '../../store/models/Company';
import {
  DynamicForm,
  FieldConfig,
  FormValues,
} from '../../components/DynamicForm';
import { toJS } from 'mobx';
import { companyFieldConfigs } from '../../store/fieldConfigs/companyFieldConfigs';
import { useTranslation } from 'react-i18next';
import AdminPageContainer from '../../components/admin/AdminPageContainer';
import { TextComponent } from '../../components/sb-core-ui-kit/TextComponent';

const EditCompanyPage: React.FC = observer(() => {
  const { id } = useParams<{ id: string }>();
  const rootStore = useRootStore();
  const [company, setCompany] = useState<ICompany | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  const fetchCompany = async () => {
    if (id) {
      const fetchedCompany = await rootStore.getCompanyById();
      setCompany(fetchedCompany);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, [id, rootStore, rootStore.companiesLoaded]);

  if (isLoading) {
    return (
      <AdminPageContainer>
        <TextComponent text={t('common.pleaseWait')} size="medium" />
      </AdminPageContainer>
    );
  }

  if (!company) {
    return (
      <AdminPageContainer>
        <TextComponent text="Company not found" size="medium" />
      </AdminPageContainer>
    );
  }

  const formFields: FieldConfig[] = companyFieldConfigs.map((config) => {
    const fieldKeyString = String(config.key);
    let fieldValue;

    if (config.id === 'api_keys') {
      const companyApiKeys = company ? toJS(company.api_keys) || [] : [];
      const companyApiKeysMap = new Map(companyApiKeys.map(k => [k.key, k.value]));
      
      // config.value here is the default list of ApiKey objects from companyFieldConfigs
      fieldValue = (config.value as { key: string; value: string }[]).map(defaultApiKey => ({
        ...defaultApiKey,
        value: companyApiKeysMap.get(defaultApiKey.key) || defaultApiKey.value,
      }));
    } else {
      fieldValue = company ? toJS((company as any)[fieldKeyString]) : config.value;
    }

    return {
      ...config,
      value: fieldValue,
      // Ensure options is always an array, even if not explicitly in config
      options: (config as any).options || [], 
    } as FieldConfig;
  });

  const handleSubmit = async (values: FormValues) => {
    if (!id) {
      return;
    }
    
    setIsLoading(true);
    await rootStore.updateCompany(values as unknown as ICompany);
    await rootStore.loadCompanies();
    await fetchCompany();
    await rootStore.authStore.loadUserSessionInfo();
    setIsLoading(false);
  };

  const handleRefreshToken = async () => { // Removed unused 'values' parameter
    if (!id) {
      return;
    }
    setIsLoading(true);
    const updatedCompany = await rootStore.refreshToken();
    if (updatedCompany) {
      setCompany(updatedCompany as ICompany);
      localStorage.setItem('userToken', updatedCompany.token.value);
    }
    setIsLoading(false);
  };

  return (
    <AdminPageContainer>
      <h1 className="text-2xl font-semibold mb-2">{t('EditCompanyPage.title')}</h1>
      <p className="text-gray-600 mb-6">{t('EditCompanyPage.description')}</p>
      <div className="flex w-full space-x-12 rtl:space-x-reverse">
        <div className="w-1/2">
          <DynamicForm
            fields={formFields}
            formContext="EditCompanyPage"
            onSubmit={handleSubmit}
            refreshToken={handleRefreshToken}
            isLoading={isLoading}
            formType="update"
          />
        </div>
        <div className="w-1/2">
          {/* Additional content can be added here if needed */}
        </div>
      </div>
    </AdminPageContainer>
  );
});

export { EditCompanyPage };
