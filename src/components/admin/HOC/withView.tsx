import React from "react";

interface ViewProps {
  title: string;
  description: string;
}

const withView = (title: string, description: string) =>
  (WrappedComponent: React.ComponentType<any>) => {
    return (props: any) => (
      <>
        <h3 className="text-3xl font-bold mb-4">{title}</h3>

        <p>{description}</p>
        <WrappedComponent {...props} />
      </>
    );
  };

export { withView };
