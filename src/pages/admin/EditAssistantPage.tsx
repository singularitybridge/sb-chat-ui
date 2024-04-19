import React from 'react'; // Add this line

import { useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../store/common/RootStoreContext';
import { IAssistant } from '../../store/models/Assistant';
import { withPage } from '../../components/admin/HOC/withPage';
import {
  DynamicForm,
  FieldConfig,
  FormValues,
} from '../../components/DynamicForm';
import { toJS } from 'mobx';
import { assistantFieldConfigs } from '../../store/fieldConfigs/assistantFieldConfigs';
import { TagsInput } from '../../components/InputTags';

const EditAssistantView: React.FC = observer(() => {
  
  const { key } = useParams<{ key: string }>();
  const rootStore = useRootStore();
  const assistant = key ? rootStore.getAssistantById(key) : null;
  const [isLoading, setIsLoading] = React.useState(false);

  if (rootStore.assistantsLoaded === false) {
    return <div>Loading...</div>;
  }

  if (!assistant) {
    return <div>Assistant not found</div>;
  }

  const formFields: FieldConfig[] = assistantFieldConfigs.map(
    ({ id, label, key, type, visibility }) => {
      const fieldKeyString = String(key);
      return {
        key: key,
        label: label,
        value: assistant ? toJS((assistant as any)[fieldKeyString]) : '',
        id: id,
        type: type,
        visibility: visibility,
      };
    }
  );

  const handleSubmit = async (values: FormValues) => {
    console.log('Form Values:', values);
    if (!key) {
      return;
    }
    setIsLoading(true);
    await rootStore.updateAssistant(key, values as unknown as IAssistant);
    setIsLoading(false);
  };

  return (
    <>
      <div className="flex w-full space-x-5">
        <div className="w-1/2">
          <DynamicForm
            fields={formFields}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            formType="update"
          />
        </div>
        <div className="w-1/2">
          <TagsInput
            title="Actions"
            description="Actions allow assitant/agent to use tools and exhange information"
            selectedTags={[]}
            availableTags={[
              {
                id: 'add-user',
                name: 'add-user',
              },
              {
                id: 'remove-user',
                name: 'remove-user',
              },
            ]}
            onTagsChange={(updatedTags) => {
              console.log(updatedTags);
            }}
          />
        </div>
      </div>
    </>
  );
});

const EditAssistantPage = withPage(
  'Edit AI Assistant',
  'update your ai agents here',
  () => {
    console.log('edit assistant');
  }
)(EditAssistantView);
export { EditAssistantPage, EditAssistantView };
