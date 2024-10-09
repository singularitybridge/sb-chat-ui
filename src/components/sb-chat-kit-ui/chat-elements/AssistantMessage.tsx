import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/solid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MessageWrapper } from './MessageWrapper';

interface AssistantMessageProps {
  text: string;
  assistantName: string;
}

const AssistantMessage: React.FC<AssistantMessageProps> = ({ text, assistantName }) => {
  const PreComponent: React.FC<React.HTMLProps<HTMLPreElement>> = (props) => (
    <pre className='text-left' dir="ltr" {...props} />
  );

  const TableComponent: React.FC<React.HTMLProps<HTMLTableElement>> = (props) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full bg-white border border-gray-300 shadow-sm rounded-lg overflow-hidden" {...props} />
    </div>
  );

  const TheadComponent: React.FC<React.HTMLProps<HTMLTableSectionElement>> = (props) => (
    <thead className="bg-gray-100" {...props} />
  );

  const ThComponent: React.FC<React.HTMLProps<HTMLTableHeaderCellElement>> = (props) => (
    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider" {...props} />
  );

  const TdComponent: React.FC<React.HTMLProps<HTMLTableDataCellElement>> = (props) => (
    <td className="px-4 py-2 text-sm text-gray-900 border-t border-gray-200" {...props} />
  );

  const TrComponent: React.FC<React.HTMLProps<HTMLTableRowElement>> = (props) => (
    <tr className="hover:bg-gray-50" {...props} />
  );

  const UlComponent: React.FC<React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>> = (props) => (
    <ul className="list-disc rtl:pr-5 ltr:pl-5 my-2" {...props} />
  );

  const OlComponent: React.FC<React.DetailedHTMLProps<React.OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>> = (props) => (
    <ol className="list-decimal rtl:pr-5 ltr:pl-5 my-2" {...props} />
  );

  const LiComponent: React.FC<React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>> = (props) => (
    <li className="mb-1 rtl:mr-4 ltr:ml-4" {...props} />
  );

  return (
    <MessageWrapper icon={<SparklesIcon className="w-5 h-5 text-gray-700" />} bgColor="" borderColor="bg-blue-100" role={assistantName}>
      <ReactMarkdown 
        className="prose prose-sm max-w-none break-words rtl:text-right ltr:text-left"
        remarkPlugins={[remarkGfm]}        
        components={{
          pre: PreComponent,
          table: TableComponent,
          thead: TheadComponent,
          th: ThComponent,
          td: TdComponent,
          tr: TrComponent,
          ul: UlComponent,
          ol: OlComponent,
          li: LiComponent,
        }}
      >
        {text}
      </ReactMarkdown>
    </MessageWrapper>
  );
};

export { AssistantMessage };
