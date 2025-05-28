import React, { useState, useEffect } from 'react';
import { DynamicForm, FieldConfig, FormValues } from '../components/DynamicForm';
import { defaultTeamFieldConfigs, getTeamFieldConfigs } from '../store/fieldConfigs/teamFieldConfigs';
import { observer } from 'mobx-react';
import { useRootStore } from '../store/common/RootStoreContext';
import { ITeam } from '../store/models/Team';
import { useTranslation } from 'react-i18next';

const NewTeamView: React.FC = observer(() => {
  const { t, i18n } = useTranslation();
  const rootStore = useRootStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formFields, setFormFields] = useState<FieldConfig[]>(defaultTeamFieldConfigs);
  const [isFieldConfigsLoading, setIsFieldConfigsLoading] = useState(true);

  useEffect(() => {
    const fetchFieldConfigs = async () => {
      try {
        const configs = await getTeamFieldConfigs(i18n.language);
        setFormFields(configs);
      } catch (error) {
        console.error('Failed to fetch team field configs:', error);
        // Fallback to default configs if fetch fails
        setFormFields(defaultTeamFieldConfigs);
      } finally {
        setIsFieldConfigsLoading(false);
      }
    };

    fetchFieldConfigs();
  }, [i18n.language]);

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      // Only include name, description, and icon
      // _id will be assigned by the server
      // companyId is automatically added from the authentication token
      await rootStore.createTeam({
        name: values.name as string,
        description: values.description as string,
        icon: values.icon as string,
      } as ITeam);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to create team:', error);
      setIsLoading(false);
    }
  };

  if (isFieldConfigsLoading) {
    return <div>{t('common.pleaseWait')}</div>;
  }

  return (
    <div className="w-full">
      <DynamicForm
        formContext="teamFieldConfigs"
        fields={formFields}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        formType="create"
      />
    </div>
  );
});

export { NewTeamView };
