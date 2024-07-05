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
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAIAssist = async (aiPrompt: string) => {
    setIsLoading(true);
    try {
      const completionRequest = {
        systemPrompt,
        userInput: aiPrompt,
      };
      const completionContent = await getCompletion(completionRequest);
      onChange(completionContent);
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
    />
  );
};

export { AIAssistedTextareaContainer };