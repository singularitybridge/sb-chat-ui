import React from 'react';
import { IconButton } from '../IconButton';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

const withPage =
  (title: string, description: string, onAction: () => void) =>
  (WrappedComponent: React.ComponentType<any>) => {
    const WithPageComponent = (props: any) => {
      return (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-3xl font-bold mb-1">{title}</h3>
              <span className="inline-block whitespace-nowrap rounded-[0.27rem] bg-primary-100 px-[0.65em] pb-[0.25em] pt-[0.35em] text-center align-baseline text-[0.75em] font-bold leading-none text-primary-700">
                {description}
              </span>
            </div>
            <div>
              <IconButton
                icon={<PlusCircleIcon className="w-6 h-6 text-stone-400" />}
                onClick={onAction}
                data-te-toggle="modal"
                data-te-target="#exampleModal"
              />
            </div>
          </div>
          <hr className="my-4 h-0.5 border-t-0 bg-neutral-100 opacity-100 dark:opacity-50" />
          <WrappedComponent {...props} />
        </>
      );
    };

    WithPageComponent.displayName = `WithPage(${
      WrappedComponent.displayName || WrappedComponent.name || 'Component'
    })`;

    return WithPageComponent;
  };

export { withPage };
