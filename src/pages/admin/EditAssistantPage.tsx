import React from 'react'; // Add this line

import { useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../store/common/RootStoreContext';
import { AssistantKeys, IAssistant } from '../../store/models/Assistant';
import { withPage } from '../../components/admin/HOC/withPage';
import {
  DynamicForm,
  FieldConfig,
  FieldType,
  FormValues,
} from '../../components/DynamicForm';
import { toJS } from 'mobx';

const EditAssistantView: React.FC = observer(() => {

  const { key } = useParams<{ key: string }>();
  const rootStore = useRootStore();
  const assistant = key ? rootStore.getAssistantById(key) : null;
  const [isLoading, setIsLoading] = React.useState(false); 

  if (rootStore.assistantsLoaded === false) {
    return <div>Loading...</div>; // Fix the problem here
  }

  if (!assistant) {
    return <div>Assistant not found</div>;
  }

  const fieldKeys: AssistantKeys[] = [
    'assistantId',
    'name',
    'description',
    'introMessage',
    'voice',
    'language',
    'llmModel',
    'llmPrompt',
    'identifiers'
  ];

  const fieldTypeMap: Partial<Record<AssistantKeys, FieldType>> = {
    assistantId: 'input',
    name: 'input',
    description: 'textarea',
    llmModel: 'input',
    llmPrompt: 'textarea',
    introMessage: 'input',
    voice: 'input',
    language: 'input',
    identifiers: 'key-value-list',
  };

  const formFields: FieldConfig[] = fieldKeys.map((key) => {
    const fieldKeyString = String(key);
    const fieldType = fieldTypeMap[key] || 'input';

    return {
      label: fieldKeyString.charAt(0).toUpperCase() + fieldKeyString.slice(1),
      value: assistant ? toJS((assistant as any)[fieldKeyString]) : '', // Using type assertion here
      id: fieldKeyString,
      type: fieldType,
    };
  });

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
      <div className="flex w-full">
        <div className="w-1/2">
          <DynamicForm fields={formFields} onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
        <div className="w-1/2">Test your assistant here</div>
      </div>
    </>
  );
});

const EditAssistantPage = withPage(
  'Edit AI Assistant',
  'update your ai agents here'
)(EditAssistantView);
export { EditAssistantPage };
