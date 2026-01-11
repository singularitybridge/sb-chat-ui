import React, { ReactNode, useState } from 'react';

interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  defaultActiveTab?: string;
}

const Tabs: React.FC<TabsProps> = ({ tabs, defaultActiveTab }) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab || tabs[0]?.id);

  return (
    <>
      <ul
        className="mb-5 flex list-none flex-row flex-wrap border-b-0 pl-0"
        role="tablist"
      >
        {tabs.map((tab) => (
          <li role="presentation" key={tab.id}>
            <button
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`my-2 block border-x-0 border-b-2 border-t-0 px-3 mr-2 pb-2 pt-2 text-xs font-medium uppercase leading-tight transition-colors
                ${
                  activeTab === tab.id
                    ? 'border-primary text-primary dark:border-primary-400 dark:text-primary-400'
                    : 'border-transparent text-neutral-500 hover:border-transparent hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-transparent'
                }`}
              role="tab"
              aria-controls={tab.id}
              aria-selected={activeTab === tab.id}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="mb-6">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`transition-opacity duration-150 ease-linear ${
              activeTab === tab.id ? 'block opacity-100' : 'hidden opacity-0'
            }`}
            id={tab.id}
            role="tabpanel"
            aria-labelledby={`${tab.id}-tab`}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </>
  );
};

export { Tabs };
