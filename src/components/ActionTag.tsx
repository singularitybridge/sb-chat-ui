import React, { lazy, Suspense } from 'react';
import { LucideProps } from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';
import clsx from 'clsx';

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
  onRemove?: () => void; // Made optional
  className?: string;    // Added className prop
}

const ActionTag: React.FC<ActionTagProps> = ({ iconName, title, description, serviceName, onRemove, className }) => {
  return (
    <div className={clsx('p-3 bg-slate-100 rounded-xl', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {iconName in dynamicIconImports ? (
            <Icon name={iconName} className="w-5 h-5" />
          ) : (
            <span className="w-5 h-5 flex items-center justify-center text-sm">{iconName}</span>
          )}
          <span className="font-medium text-base text-slate-600">{title}</span>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-gray-500 hover:text-gray-800"
          >
            <Icon name="x" size={16} />
          </button>
        )}
      </div>
      <p className="text-sm mt-1 text-slate-700">{description}</p>
      <div className="flex">
        <div className="text-xs text-gray-500 mt-4 bg-blue-100 px-2.5 py-1 rounded-2xl">{serviceName}</div>
      </div>
    </div>
  );
};

export default ActionTag;
