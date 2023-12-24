import React from 'react';

const withPage =
  (title: string, description: string) =>
  (WrappedComponent: React.ComponentType<any>) => {
    return (props: any) => (
      <>
        <h3 className="text-3xl font-bold mb-1">{title}</h3>
        <span className="inline-block whitespace-nowrap rounded-[0.27rem] bg-primary-100 px-[0.65em] pb-[0.25em] pt-[0.35em] text-center align-baseline text-[0.75em] font-bold leading-none text-primary-700">
          {description}
        </span>
        <hr className=" my-4 h-0.5 border-t-0 bg-neutral-100 opacity-100 dark:opacity-50" />
        <WrappedComponent {...props} />
      </>
    );
  };

export { withPage };
