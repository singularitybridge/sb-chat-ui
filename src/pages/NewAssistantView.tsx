import React, { useState } from 'react';
import { useRootStore } from '../store/common/RootStoreContext';
import { AssistantKeys, IAssistant } from '../store/models/Assistant';
import { DynamicForm, FieldConfig, FieldType, FormValues } from '../components/DynamicForm';

const NewAssistantView: React.FC = () => {
    const rootStore = useRootStore();
    const [isLoading, setIsLoading] = useState(false);

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
            value: '', // Set default value to empty string
            id: fieldKeyString,
            type: fieldType,
        };
    });

    const handleSubmit = async (values: FormValues) => {
        setIsLoading(true);
        console.log('values', values);
        // await rootStore.createAssistant(values as unknown as IAssistant);
        setIsLoading(false);
    };

    return (
        <div className="flex w-full">
            <div className="w-1/2">
                <DynamicForm fields={formFields} onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
            <div className="w-1/2">Test your assistant here</div>
        </div>
    );
};

export { NewAssistantView };