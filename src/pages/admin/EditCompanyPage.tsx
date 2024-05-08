import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../store/common/RootStoreContext';
import { ICompany } from '../../store/models/Company';
import { withPage } from '../../components/admin/HOC/withPage';
import {
  DynamicForm,
  FieldConfig,
  FormValues,
} from '../../components/DynamicForm';
import { toJS } from 'mobx';
import { companyFieldConfigs } from '../../store/fieldConfigs/companyFieldConfigs';
import { useTranslation } from 'react-i18next';

const EditCompanyView: React.FC = observer(() => {
  const { id } = useParams<{ id: string }>();
  const rootStore = useRootStore();
  const [company, setCompany] = useState<ICompany | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchCompany = async () => {
      if (id && !rootStore.companiesLoaded) {
        // Optionally, load companies here if not already loaded
      }

      if (id) {
        const fetchedCompany = await rootStore.getCompanyById(id);
        setCompany(fetchedCompany);
        setIsLoading(false);
      }
    };

    fetchCompany();
  }, [id, rootStore, rootStore.companiesLoaded]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!company) {
    return <div>Company not found</div>;
  }

  const formFields: FieldConfig[] = companyFieldConfigs.map(
    ({ id, label, key, type, visibility }) => {
      const fieldKeyString = String(key);
      debugger
      return {
        key: key,
        label: label,
        value: company ? toJS((company as any)[fieldKeyString]) : '',
        id: id,
        type: type,
        visibility: visibility,
      };
    }
  );

  const handleSubmit = async (values: FormValues) => {
    console.log('Form Values:', values);
    if (!id) {
      return;
    }
    setIsLoading(true);
    await rootStore.updateCompany(id, values as unknown as ICompany);
    setIsLoading(false);
  };

  const handleRefreshToken = async (values: FormValues) => {
    if (!id) {
      return;
    }
    setIsLoading(true);
    const updatedCompany = await rootStore.refreshToken(
      id,
      values as unknown as ICompany
    );
    setCompany(updatedCompany);
    setIsLoading(false);
  };

  return (
    <>
      <div className="flex w-full">
        <div className="w-1/2">
          <DynamicForm
            fields={formFields}
            onSubmit={handleSubmit}
            refreshToken={handleRefreshToken}
            isLoading={isLoading}
            formType="update"
          />
        </div>
        <div className="w-1/2"></div>
      </div>
    </>
  );
});

const EditCompanyPage = withPage(
  'EditCompanyPage.title',
  'EditCompanyPage.description',
  () => {
    console.log('edit company');
  }
)(EditCompanyView);

export { EditCompanyPage, EditCompanyView };
