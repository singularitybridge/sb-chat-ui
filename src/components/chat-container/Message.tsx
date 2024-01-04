import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/solid';

interface MessageProps {
  text: string;
}

const Message: React.FC<MessageProps> = ({ text }) => {
  return (
    <div className="flex gap-3 my-4 text-gray-600 text-sm flex-1">
      <span className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8">
        <div className="rounded-full bg-gray-100 border p-1">
          <SparklesIcon className="w-5 h-5 text-gray-700" />
        </div>
      </span>
      <p className="leading-relaxed">
        <span className="block font-bold text-gray-800">AI </span>
        {text}
      </p>
    </div>
  );
};

export { Message };
