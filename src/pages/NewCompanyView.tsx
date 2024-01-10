import React, { useState, useEffect } from 'react';
import {
  DynamicForm,
  FieldConfig,
  FormValues,
  KeyValueListFieldConfig,
} from '../components/DynamicForm';

import { observer } from 'mobx-react';
import { useRootStore } from '../store/common/RootStoreContext';
import { companyFieldConfigs } from '../store/fieldConfigs/companyFieldConfigs';
import { ICompany } from '../store/models/Company';

const NewCompanyView: React.FC = observer(() => {
  const rootStore = useRootStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formFields, setFormFields] = useState<FieldConfig[]>([]);

  useEffect(() => {
    const initialFormFields = companyFieldConfigs.map(
      ({ id, key, label, type, visibility, value }) => {
        return {
          id: id,
          key: key,
          label: label,
          value: value,
          type: type,
          visibility: visibility,
        } as KeyValueListFieldConfig;
      }
    );

    setFormFields(initialFormFields);
  }, []); // Empty dependency array ensures this runs only once

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);
    await rootStore.addCompany(values as unknown as ICompany);
    setIsLoading(false);
  };
  return (
    <DynamicForm
      fields={formFields}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      formType="create"
    />
  );
});

export { NewCompanyView };
