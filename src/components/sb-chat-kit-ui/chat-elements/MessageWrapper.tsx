import React from 'react';

interface MessageWrapperProps {
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
  role: string;
  children: React.ReactNode;
}

const MessageWrapper: React.FC<MessageWrapperProps> = ({ icon, bgColor, borderColor, role, children }) => {
  return (
    <div className={`flex ${bgColor} gap-3 my-1 text-gray-600 text-sm flex-1 py-2`}>
      <span className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8">
        <div className={`rounded-full ${borderColor} border p-1`}>
          {icon}
        </div>
      </span>
      <div className="leading-relaxed">
        <span className="block font-bold text-gray-800">{role}</span>
        {children}
      </div>
    </div>
  );
};

export { MessageWrapper };
