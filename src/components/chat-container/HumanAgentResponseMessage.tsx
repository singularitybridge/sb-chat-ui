import { UserIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface HumanAgentResponseMessageProps {
  text: string;
}

const HumanAgentResponseMessage: React.FC<HumanAgentResponseMessageProps> = ({ text }) => {
  return (
    <div className="flex bg-yellow-100 gap-3 my-4 text-gray-600 text-sm flex-1 py-3">
    <span className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8">
      <div className="rounded-full bg-yellow-300 border p-1">
        <UserIcon className="w-5 h-5 text-gray-700" />
      </div>
    </span>
    <div className="leading-relaxed">
      <span className="block font-bold text-gray-800">Support Reviewer </span>
      <ReactMarkdown className="prose prose-sm ">{text}</ReactMarkdown>
    </div>
  </div>
  );
};

export { HumanAgentResponseMessage };
