import React from 'react';
import clsx from 'clsx';
import { ButtonProps } from './Button';

interface LoadingButtonProps extends ButtonProps {
    isLoading: boolean;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
    isLoading,
    children,
    additionalClassName,
    ...props
}) => {
    const className = clsx(
        'bg-primary',
        'text-white',
        'px-2.5',
        'py-1.5',
        'mr-2 mb-2',
        'rounded-md',
        'text-base',
        additionalClassName,
    );

    return (
        <button {...props} disabled={isLoading} className={className}>
            {isLoading ? 'Loading...' : children}
        </button>
    );
};

export default LoadingButton;