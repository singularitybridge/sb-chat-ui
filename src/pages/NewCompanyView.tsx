import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DynamicForm, FormValues } from '../components/DynamicForm';
import { useCompanyStore } from '../store/useCompanyStore';
import { companyFieldConfigs } from '../store/fieldConfigs/companyFieldConfigs';
import { ICompany } from '../types/entities';

const NewCompanyView: React.FC = () => {
  const { t } = useTranslation();
  const { addCompany } = useCompanyStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      await addCompany(values as unknown as ICompany);
      toast.success(t('company.createSuccess'));
    } catch (_error) {
      toast.error(t('company.createError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DynamicForm
      fields={companyFieldConfigs}
      formContext='EditCompanyPage'
      onSubmit={handleSubmit}
      isLoading={isLoading}
      formType="create"
    />
  );
};

export { NewCompanyView };
