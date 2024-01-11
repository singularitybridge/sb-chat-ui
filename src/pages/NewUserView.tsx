import React, { useState, useEffect } from 'react';
import {
  DynamicForm,
  FieldConfig,
  FormValues,
  KeyValueListFieldConfig,
} from '../components/DynamicForm';
import { observer } from 'mobx-react';
import { useRootStore } from '../store/common/RootStoreContext';
import { IUser } from '../store/models/User';
import { userFieldConfigs } from '../store/fieldConfigs/userFieldConfigs';


const NewUserView: React.FC = observer(() => {
  const rootStore = useRootStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formFields, setFormFields] = useState<FieldConfig[]>([]);

  useEffect(() => {
    const initialFormFields = userFieldConfigs.map(
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
    try {
      await rootStore.addUser(values as unknown as IUser);
      // Handle successful submission, e.g., show a success message, redirect, etc.
    } catch (error) {
      console.error('Failed to add user', error);
      // Handle errors, e.g., show an error message
    } finally {
      setIsLoading(false);
    }
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

export { NewUserView };
