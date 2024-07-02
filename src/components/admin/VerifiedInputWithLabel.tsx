import React, { useState } from 'react';
import { IconButton } from './IconButton';
import {
  PlusCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/solid';
import InputWithLabel from '../sb-core-ui-kit/InputWithLabel';

interface VerifiedInputWithLabelProps {
  apiKey: string;
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  onVerify: (value: string, key: string) => Promise<boolean>;
  autoFocus?: boolean;
  error?: string;
  disabled?: boolean;
}

const VerifiedInputWithLabel: React.FC<VerifiedInputWithLabelProps> = ({
  apiKey,
  id,
  label,
  type = 'text',
  value,
  onChange,
  onVerify,
  autoFocus,
  error,
  disabled,
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  const handleVerify = async () => {
    setIsVerifying(true);
    const isValid = await onVerify(value, apiKey);
    setIsVerified(isValid);
    setIsVerifying(false);
  };

  const verificationIcon = isVerifying ? (
    <PlusCircleIcon className="w-6 h-6 animate-spin mx-4 my-2" />
  ) : isVerified === true ? (
    <CheckCircleIcon className="w-6 h-6 text-green-400 mx-4 my-2" />
  ) : isVerified === false ? (
    <XCircleIcon className="w-6 h-6 text-red-400 mx-4 my-2" />
  ) : (
    <QuestionMarkCircleIcon className="w-6 h-6 mx-4 my-2" />
  );

  return (
    <div className="relative mb-2 flex items-center">
      <InputWithLabel
        id={id}
        label={label}
        type={type}
        value={value}
        onChange={onChange}
        autoFocus={autoFocus}
        error={error}
        disabled={disabled}
      />
      <IconButton
        id={`${id}-verify`}
        icon={verificationIcon}
        onClick={handleVerify}
        disabled={isVerifying || disabled}
      />
    </div>
  );
};

export default VerifiedInputWithLabel;