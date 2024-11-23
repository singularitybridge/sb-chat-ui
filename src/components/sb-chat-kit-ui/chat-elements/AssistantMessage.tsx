import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/solid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MessageWrapper } from './MessageWrapper';
import { formatRelativeTime } from '../../../utils/dateUtils';

interface AssistantMessageProps {
  text: string;
  assistantName: string;
  createdAt: number;
}

const AssistantMessage: React.FC<AssistantMessageProps> = ({ text, assistantName, createdAt }) => {
  const PreComponent: React.FC<React.HTMLProps<HTMLPreElement>> = (props) => (
    <pre className='not-prose text-left my-2 overflow-x-auto bg-gray-900 text-lime-300 p-4 rounded-lg [&>*]:bg-transparent [&>*]:text-lime-300 [&>*]:m-0' dir="ltr" {...props} />
  );

  const TableComponent: React.FC<React.HTMLProps<HTMLTableElement>> = (props) => (
    <div className="overflow-x-auto my-2">
      <table className="min-w-full bg-white border border-gray-300 shadow-sm rounded-lg overflow-hidden" {...props} />
    </div>
  );

  const TheadComponent: React.FC<React.HTMLProps<HTMLTableSectionElement>> = (props) => (
    <thead className="bg-gray-100" {...props} />
  );

  const ThComponent: React.FC<React.HTMLProps<HTMLTableHeaderCellElement>> = (props) => (
    <th className="px-4 py-2 rtl:text-right ltr:text-left text-sm font-semibold text-gray-700 uppercase tracking-wider" {...props} />
  );

  const TdComponent: React.FC<React.HTMLProps<HTMLTableDataCellElement>> = (props) => (
    <td className="px-4 py-2 rtl:text-right ltr:text-left text-sm text-gray-900 border-t border-gray-200" {...props} />
  );

  const TrComponent: React.FC<React.HTMLProps<HTMLTableRowElement>> = (props) => (
    <tr className="hover:bg-gray-50" {...props} />
  );

  const UlComponent: React.FC<React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>> = (props) => (
    <ul className="list-disc rtl:pr-4 ltr:pl-4 my-2" {...props} />
  );

  const OlComponent: React.FC<React.DetailedHTMLProps<React.OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>> = (props) => (
    <ol className="list-decimal rtl:pr-4 ltr:pl-4 my-2" {...props} />
  );

  const LiComponent: React.FC<React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>> = (props) => (
    <li className="mb-1" {...props} />
  );

  const ParagraphComponent: React.FC<React.HTMLProps<HTMLParagraphElement>> = (props) => (
    <p className="my-2 text-sm leading-relaxed" {...props} />
  );

  const CodeComponent: React.FC<{ node?: any; inline?: boolean; className?: string; children?: React.ReactNode }> = ({
    inline,
    className,
    children,
    ...props
  }) => {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <pre className={`text-left my-2 p-4 bg-gray-800 text-white rounded ${className}`} dir="ltr" {...props}>
        <code className={`language-${match[1]} text-sm`}>{children}</code>
      </pre>
    ) : (
      <code className={`${className} text-sm bg-gray-200 text-gray-800 rounded px-1`} {...props}>
        {children}
      </code>
    );
  };

  return (
    <MessageWrapper 
      icon={<SparklesIcon className="w-5 h-5 text-gray-700" />} 
      bgColor="" 
      borderColor="bg-blue-100" 
      role={assistantName}
      dateText={formatRelativeTime(createdAt)}
    >
      <div className="prose prose-sm max-w-none text-sm break-words rtl:text-right ltr:text-left overflow-hidden prose-pre:p-0">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            p: ParagraphComponent,
            pre: PreComponent,
            table: TableComponent,
            thead: TheadComponent,
            th: ThComponent,
            td: TdComponent,
            tr: TrComponent,
            ul: UlComponent,
            ol: OlComponent,
            li: LiComponent,
            code: CodeComponent,
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    </MessageWrapper>
  );
};

export { AssistantMessage };
