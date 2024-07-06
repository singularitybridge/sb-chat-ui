import React, { useState } from 'react';
import {
  DynamicForm,
  FormValues,
} from '../../components/DynamicForm';

import { observer } from 'mobx-react';
import { useRootStore } from '../../store/common/RootStoreContext';
import { IAction } from '../../store/models/Action';
import { actionFieldConfigs } from '../../store/fieldConfigs/actionFieldConfigs';

const NewActionView: React.FC = observer(() => {
  const rootStore = useRootStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      await rootStore.addAction(values as unknown as IAction);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DynamicForm
      formContext="CreateNewAction"
      fields={actionFieldConfigs}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      formType="create"
    />
  );
});

export { NewActionView };
