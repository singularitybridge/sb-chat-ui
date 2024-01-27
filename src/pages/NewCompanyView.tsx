import React, { useState } from 'react';
import {
  DynamicForm,
  FormValues,
} from '../components/DynamicForm';

import { observer } from 'mobx-react';
import { useRootStore } from '../store/common/RootStoreContext';
import { companyFieldConfigs } from '../store/fieldConfigs/companyFieldConfigs';
import { ICompany } from '../store/models/Company';

const NewCompanyView: React.FC = observer(() => {
  const rootStore = useRootStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);
    await rootStore.addCompany(values as unknown as ICompany);
    setIsLoading(false);
  };
  return (
    <DynamicForm
      fields={companyFieldConfigs}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      formType="create"
    />
  );
});

export { NewCompanyView };
