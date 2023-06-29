import React, { useEffect, useState } from "react";
import {
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { DataItem } from "../../components/admin/DataItem";

interface LogItemProps {
  icon: React.ReactNode;
  name: string;
  title: string;
  input: React.ReactNode;
  output?: React.ReactNode;
  status: string;
  indent?: boolean;
}


const LogItem: React.FC<LogItemProps> = ({
  icon,
  name,
  title,
  input,
  output,
  status,
  indent = false,
}) => {
  return (
    <li>
      <div className="flex-start md:flex">
        <div className="-ml-[11px] flex h-[25px] w-[25px] items-center justify-center rounded-full bg-info-100 text-info-700">
          {icon}
        </div>

        {indent && (
          <div className=" mt-3 ml-1 w-5 border-t border-indigo-200"></div>
        )}

        <div className="mb-4 ml-4 block max-w-md rounded-lg bg-neutral-50 p-4 shadow-md shadow-black/5 dark:bg-neutral-700 dark:shadow-black/10">
          <div className="mb-4 flex  space-x-4">

            <span className="inline-block whitespace-nowrap rounded-full bg-orange-200 px-[0.65em] pb-[0.25em] pt-[0.35em] text-center align-baseline text-[0.75em] font-bold leading-none text-primary-700">
              {name}
            </span>

            <span className="inline-block whitespace-nowrap rounded-full bg-primary-100 px-[0.65em] pb-[0.25em] pt-[0.35em] text-center align-baseline text-[0.75em] font-bold leading-none text-primary-700">
              {title}
            </span>

            <span className="inline-block whitespace-nowrap rounded-[0.27rem] bg-success-100 px-[0.65em] pb-[0.25em] pt-[0.35em] text-center align-baseline text-[0.75em] font-bold leading-none text-success-700">
              {typeof status === "boolean"
                ? status
                  ? "Success" 
                  : "Failure"
                : status}
            </span>
          </div>
          <div className="mb-2 text-neutral-700 dark:text-neutral-200">
            <DataItem
              title={<ArrowLeftOnRectangleIcon className="w-5 h-5" />}
              value={<div className=" text-sm">{input}</div>}
            />
            {output && (
              <DataItem
                title={<ArrowRightOnRectangleIcon className="w-5 h-5" />}
                value={<div className=" text-sm">{output}</div>}
              />
            )}
          </div>
        </div>
      </div>
    </li>
  );
};

export { LogItem };
