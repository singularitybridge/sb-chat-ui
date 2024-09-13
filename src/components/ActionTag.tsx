import React, { lazy, Suspense } from 'react';
import { LucideProps } from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';

const fallback = <div style={{ background: '#ddd', width: 24, height: 24 }} />;

export interface IconProps extends Omit<LucideProps, 'ref'> {
  name: string;
}

const loadIcon = (name: string) => {
  const importIcon = dynamicIconImports[name as keyof typeof dynamicIconImports];
  if (!importIcon) {
    console.warn(`Icon '${name}' not found. Using fallback.`);
    return Promise.resolve({ default: () => fallback });
  }
  return importIcon().then((module: any) => ({ default: module.default }));
};

export const Icon = ({ name, ...props }: IconProps) => {
  const LazyIcon = lazy(() => loadIcon(name));

  return (
    <Suspense fallback={fallback}>
      <LazyIcon {...props} />
    </Suspense>
  );
};

export interface ActionTagProps {
  iconName: string;
  title: string;
  description: string;
  serviceName: string;
  onRemove: () => void;
}

const ActionTag: React.FC<ActionTagProps> = ({ iconName, title, description, serviceName, onRemove }) => {
  return (
    <div className="mb-2 p-2 bg-gray-100 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {iconName in dynamicIconImports ? (
            <Icon name={iconName} className="mr-2 w-5 h-5" />
          ) : (
            <span className="mr-2 w-5 h-5 flex items-center justify-center text-sm">{iconName}</span>
          )}
          <span className="font-bold">{title}</span>
        </div>
        <button
          onClick={onRemove}
          className="text-red-500 hover:text-red-700"
        >
          <Icon name="x" size={16} />
        </button>
      </div>
      <p className="text-sm mt-1">{description}</p>
      <p className="text-xs text-gray-500 mt-1">{serviceName}</p>
    </div>
  );
};

export default ActionTag;