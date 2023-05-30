import React, { ReactNode, useEffect } from "react";
import { Tab, initTE } from "tw-elements";

interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
}

const Tabs: React.FC<TabsProps> = ({ tabs }) => {
  useEffect(() => {
    initTE({ Tab });
  }, []);

  return (
    <>
      <ul
        className="mb-5 flex list-none flex-row flex-wrap border-b-0 pl-0"
        role="tablist"
        data-te-nav-ref
      >
        {tabs.map((tab, index) => (
          <li role="presentation" key={tab.id}>
            <a
              href={`#${tab.id}`}
              className="my-2 block border-x-0 border-b-2 border-t-0 border-transparent px-3 mr-2 pb-2 pt-2 text-xs font-medium uppercase leading-tight text-neutral-500 hover:isolate hover:border-transparent hover:bg-neutral-100 focus:isolate focus:border-transparent data-[te-nav-active]:border-primary data-[te-nav-active]:text-primary dark:text-neutral-400 dark:hover:bg-transparent dark:data-[te-nav-active]:border-primary-400 dark:data-[te-nav-active]:text-primary-400"
              data-te-toggle="pill"
              data-te-target={`#${tab.id}`}
              role="tab"
              aria-controls={tab.id}
              aria-selected={index === 0 ? "true" : "false"}
              {...(index === 0 && { 'data-te-nav-active': true })}
            >
              {tab.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="mb-6">
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            className={`hidden opacity-${index === 0 ? '100' : '0'} transition-opacity duration-150 ease-linear data-[te-tab-active]:block`}
            id={tab.id}
            role="tabpanel"
            aria-labelledby={`${tab.id}-tab`}
            {...(index === 0 && { 'data-te-tab-active': true })}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </>
  );
};

export { Tabs };
