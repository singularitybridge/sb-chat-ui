import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import {
  DynamicForm,
  FieldConfig,
  FormValues,
  KeyValueListFieldConfig,
} from '../components/DynamicForm';
import { useUserStore } from '../store/useUserStore';
import { IUser } from '../types/entities';
import { userFieldConfigs } from '../store/fieldConfigs/userFieldConfigs';

const NewUserView: React.FC = () => {
  const { t } = useTranslation();
  const { addUser } = useUserStore();
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
  }, []);

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      await addUser(values as unknown as IUser);
      toast.success(t('user.createSuccess'));
    } catch (_error) {
      toast.error(t('user.createError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DynamicForm
      formContext="CreateNewUser"
      fields={formFields}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      formType="create"
    />
  );
};

export { NewUserView };
