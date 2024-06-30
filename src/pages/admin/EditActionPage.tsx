// file path: 
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { observer } from 'mobx-react';
import { useRootStore } from '../../store/common/RootStoreContext';
import { IAction } from '../../store/models/Action';
import { withPage } from '../../components/admin/HOC/withPage';
import { DynamicForm, FieldConfig, FormValues } from '../../components/DynamicForm';
import { toJS } from 'mobx';
import { actionFieldConfigs } from '../../store/fieldConfigs/actionFieldConfigs';

const EditActionView: React.FC = observer(() => {

  const { id } = useParams<{ id: string }>();
  const rootStore = useRootStore();
  const action = id ? rootStore.getActionById(id) : null;
  const [isLoading, setIsLoading] = useState(false);

  if (rootStore.actionsLoaded === false) {
    return <div>Loading...</div>;
  }

  if (!action) {
    return <div>Action not found</div>;
  }

  const formFields: FieldConfig[] = actionFieldConfigs.map(({ id, label, key, type, visibility }) => {
    const fieldKeyString = String(key);
    return {
      key: key,
      label: label,
      value: action ? toJS((action as any)[fieldKeyString]) : '',
      id: id,
      type: type,
      visibility: visibility,
    };
  });

  const handleSubmit = async (values: FormValues) => {
    if (!id) {
      return;
    }
    setIsLoading(true);
    await rootStore.updateAction(id, values as unknown as IAction);
    setIsLoading(false);
  };

  return (
    <>
      <div className="flex w-full">
        <div className="w-1/2">
          <DynamicForm
            fields={formFields}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            formType="update"
            
          />
        </div>
        <div className="w-1/2">
          {/* Additional UI or functionality related to action can be added here */}
        </div>
      </div>
    </>
  );
});

const EditActionPage = withPage(
  'Edit Action',
  'Update action details here',
  () => { console.log('edit action'); }
)(EditActionView);

export { EditActionPage, EditActionView };
