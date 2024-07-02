import { FieldConfig } from '../../components/DynamicForm';
import i18n from '../../i18n';

export const assistantFieldConfigs: FieldConfig[] = [
  {
    id: 'assistantId',
    label: i18n.t('assistantFieldConfigs.assistantId'),
    key: 'assistantId',
    type: 'input',
    value: '-',
    visibility: { create: false, view: true, update: true },
  },
  {
    id: 'name',
    label: i18n.t('assistantFieldConfigs.name'),
    key: 'name',
    type: 'input',
    value: i18n.t('assistantFieldConfigs.newAssistant'),
    visibility: { create: true, view: true, update: true },
  },
  {
    id: 'description',
    key: 'description',
    label: i18n.t('assistantFieldConfigs.description'),
    type: 'textarea',
    value: i18n.t('assistantFieldConfigs.newAssistantDescription'),
    visibility: { create: true, view: true, update: true },
  },
  {
    id: 'introMessage',
    key: 'introMessage',
    label: i18n.t('assistantFieldConfigs.introMessage'),
    type: 'input',
    value: i18n.t('assistantFieldConfigs.newAssistantIntroMessage'),
    visibility: { create: true, view: true, update: true },
  },
  {
    id: 'voice',
    key: 'voice',
    label: i18n.t('assistantFieldConfigs.voice'),
    type: 'input',
    value: 'Polly.Emma',
    visibility: { create: true, view: true, update: true },
  },
  {
    id: 'language',
    key: 'language',
    label: i18n.t('assistantFieldConfigs.language'),
    type: 'input',
    value: 'en-US',
    visibility: { create: true, view: true, update: true },
  },
  {
    id: 'llmModel',
    key: 'llmModel',
    label: i18n.t('assistantFieldConfigs.llmModel'),
    type: 'input',
    value: 'gpt-3.5-turbo-1106',
    visibility: { create: true, view: true, update: true },
  },
  {
    id: 'llmPrompt',
    key: 'llmPrompt',
    label: i18n.t('assistantFieldConfigs.llmPrompt'),
    type: 'textarea',
    value: i18n.t('assistantFieldConfigs.defaultLlmPrompt'),
    visibility: { create: true, view: true, update: true },
  }
];