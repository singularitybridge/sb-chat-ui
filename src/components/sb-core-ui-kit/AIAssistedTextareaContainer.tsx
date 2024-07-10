import React, { useState } from 'react';
import { AIAssistedTextarea } from './AIAssistedTextarea';
import { getCompletion } from '../../services/api/assistantService';

interface AIAssistedTextareaContainerProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  label: string;
  systemPrompt: string;
  language?: string;
}

const AIAssistedTextareaContainer: React.FC<AIAssistedTextareaContainerProps> = ({
  id,
  value,
  onChange,
  placeholder,
  className,
  error,
  label,
  systemPrompt,
  language = 'en',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  const handleAIAssist = async (userInstructions: string) => {
    setIsLoading(true);
    try {
      const formattedSystemPrompt = `
        You are a form-filling assistant. Your task is to modify or complete text in form fields based on the given field name, existing text, and user instructions. Provide only the modified or completed text for the field, without any additional explanations.
        ${systemPrompt}
      `;

      const formattedUserInput = `
        Field Name: ${id}
        Current Text: ${value}
        Instructions: ${userInstructions}
      `;

      const completionRequest = {
        systemPrompt: formattedSystemPrompt,
        userInput: formattedUserInput,
      };

      const completionContent = await getCompletion(completionRequest);
      onChange(completionContent); // Replace the current text with the AI-generated content
      setAiPrompt(''); // Clear the AI prompt after processing
    } catch (error) {
      console.error('Error getting completion:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AIAssistedTextarea
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      error={error}
      label={label}
      onAIAssist={handleAIAssist}
      isLoading={isLoading}
      aiPrompt={aiPrompt}
      onAIPromptChange={setAiPrompt}
      language={language}
    />
  );
};

export { AIAssistedTextareaContainer };