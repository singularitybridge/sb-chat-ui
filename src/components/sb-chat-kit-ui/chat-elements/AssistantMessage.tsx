import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/solid';
import ReactMarkdown from 'react-markdown';
import { MessageWrapper } from './MessageWrapper';

interface AssistantMessageProps {
  text: string;
  assistantName: string;
}

const AssistantMessage: React.FC<AssistantMessageProps> = ({ text, assistantName }) => {
  const PreComponent: React.FC<React.HTMLProps<HTMLPreElement>> = (props) => (
    <pre dir="ltr" {...props} />
  );

  return (
    <MessageWrapper icon={<SparklesIcon className="w-5 h-5 text-gray-700" />} bgColor="" borderColor="bg-blue-100" role={assistantName}>
      <ReactMarkdown 
        className="prose prose-sm"
        components={{
          pre: PreComponent,
        }}
      >
        {text}
      </ReactMarkdown>
    </MessageWrapper>
  );
};

export { AssistantMessage };
