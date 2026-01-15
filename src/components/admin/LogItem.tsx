import React from 'react';
import {
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { DataItem } from '../../components/admin/DataItem';
import clsx from 'clsx';

interface LogItemProps {
  icon: React.ReactNode;
  name: string;
  title: string;
  input: React.ReactNode;
  output?: React.ReactNode;
  status: string;
  indent?: boolean;
  isDebugLog?: boolean; // New prop
}

const textLimit = (text: string, limit: number) => {
  if (text.length > limit) {
    return text.slice(0, limit) + '...';
  } else {
    return text;
  }
};

const LogItem: React.FC<LogItemProps> = ({
  icon,
  name,
  title,
  input,
  output,
  status,
  indent = false,
  isDebugLog = false, // Default value
}) => {
  const statusClasses = clsx(
    'inline-block whitespace-nowrap rounded-xl p-2 text-center align-baseline text-xs font-bold leading-none',
    {
      'bg-yellow-200  text-muted-foreground ': status === 'skip',
      'bg-lime-200 text-muted-foreground': status === 'success',
      'bg-red-100': status !== 'skip' && status !== 'success',
    },
  );

  const itemBackgroundColor = isDebugLog ? 'bg-pink-100' : 'bg-neutral-50'; // Change background color if isDebugLog is true

  return (
    <li>
      <div className="flex-start flex">
        <div className="-ml-[11px] flex h-[25px] w-[25px] items-center justify-center rounded-full bg-info-100 text-info-700">
          {icon}
        </div>

        {indent && (
          <div className="mt-3 ml-1 w-5 border-t border-indigo-200"></div>
        )}

        <div
          className={`flex-1 mb-4 ml-4 block max-w-md rounded-lg ${itemBackgroundColor} p-4 shadow-md shadow-black/5 dark:bg-neutral-700 dark:shadow-black/10`}
        >
          <div className="flex space-x-2 mb-2">
            <div className="inline-block whitespace-nowrap rounded-full bg-orange-100 p-2 text-center align-baseline text-[0.75em] font-bold leading-none text-muted-foreground ">
              <ol className="list-reset flex">
                <li>{name}</li>
                {title && (
                  <>
                    <li>
                      <span className="mx-1 text-neutral-500 dark:text-neutral-400">
                        /
                      </span>
                    </li>
                    <li>{textLimit(title, 15)}</li>
                  </>
                )}
              </ol>
            </div>

            <span className={statusClasses}>
              {typeof status === 'boolean'
                ? status
                  ? 'Success'
                  : 'Failure'
                : status}
            </span>
          </div>

          <div className="mb-2 text-neutral-700 dark:text-neutral-200">
            <DataItem
              title={<ArrowLeftOnRectangleIcon className="w-5 h-5" />}
              value={<div className="text-sm">{input}</div>}
            />
            {output && (
              <DataItem
                title={<ArrowRightOnRectangleIcon className="w-5 h-5" />}
                value={<div className="text-sm">{output}</div>}
              />
            )}
          </div>
        </div>
      </div>
    </li>
  );
};

export { LogItem };
