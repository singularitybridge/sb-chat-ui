import { FieldType } from '../../components/DynamicForm';
import { AssistantKeys } from '../models/Assistant';

export const assistantFieldConfigs: { key: AssistantKeys; type: FieldType }[] =
  [
    { key: 'assistantId', type: 'input' },
    { key: 'name', type: 'input' },
    { key: 'description', type: 'textarea' },
    { key: 'introMessage', type: 'input' },
    { key: 'voice', type: 'input' },
    { key: 'language', type: 'input' },
    { key: 'llmModel', type: 'input' },
    { key: 'llmPrompt', type: 'textarea' },
    { key: 'identifiers', type: 'key-value-list' },
  ];
