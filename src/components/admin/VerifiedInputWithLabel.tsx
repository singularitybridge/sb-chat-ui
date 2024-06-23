import React, { useState } from 'react';
import { IconButton } from './IconButton';
import {
  PlusCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/solid';
import { RootStore } from '../../store/models/RootStore';
import { useRootStore } from '../../store/common/RootStoreContext';
import { useTranslation } from 'react-i18next';

interface InputWithLabelProps {
  apiKey: string;
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  onVerify: (value: string, key: string) => Promise<boolean>;
  autoFocus?: boolean;
}

const VerifiedInputWithLabel: React.FC<InputWithLabelProps> = ({
  apiKey,
  id,
  label,
  type,
  value,
  onChange,
  onVerify,
  autoFocus,
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const rootStore = useRootStore();
  const isHebrew = rootStore.language === 'he';
  
  const handleVerify = async () => {
    setIsVerifying(true);
    const isValid = await onVerify(value, apiKey);
    setIsVerified(isValid);
    setIsVerifying(false);
  };

  const { t } = useTranslation();

  return (
    <div className="relative mb-2 flex items-center">
      <input
        type={type}
        value={t(value) || ''}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        className="peer m-0 block h-14 w-full rounded border border-solid border-neutral-300 bg-transparent bg-clip-padding px-3 py-4 text-base font-normal leading-tight text-neutral-700 transition duration-200 ease-linear placeholder:text-transparent focus:border-primary focus:pb-[0.625rem] focus:pt-[1.625rem] focus:text-neutral-700 focus:outline-none peer-focus:text-primary dark:border-neutral-600 dark:text-neutral-200 dark:focus:border-primary dark:peer-focus:text-primary [&:not(:placeholder-shown)]:pb-[0.625rem] [&:not(:placeholder-shown)]:pt-[1.625rem]"
        id={id}
        placeholder={label}
      />
      <label
        htmlFor={id}
        className={`text-sm pointer-events-none absolute ${isHebrew ? 'right-0' : 'left-0'}  top-0 origin-[0_0] border border-solid border-transparent px-3 py-4 text-neutral-500 transition-[opacity,_transform] duration-200 ease-linear peer-focus:-translate-y-2 peer-focus:translate-x-[0.15rem] peer-focus:scale-[0.85] peer-focus:text-primary peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:translate-x-[0.15rem] peer-[:not(:placeholder-shown)]:scale-[0.85] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary`}
      >
        {label}
      </label>
      <IconButton
        id={id}
        icon={
          isVerifying ? (
            <PlusCircleIcon className="w-6 h-6 animate-spin mx-4 my-2 " />
          ) : isVerified === true ? (
            <CheckCircleIcon className="w-6 h-6 text-green-400 mx-4 my-2 " />
          ) : isVerified === false ? (
            <XCircleIcon className="w-6 h-6 text-red-400 mx-4 my-2 " />
          ) : (
            <QuestionMarkCircleIcon className="w-6 h-6 mx-4 my-2 " />
          )
        }
        onClick={handleVerify}
        disabled={isVerifying}
      />
    </div>
  );
};

export default VerifiedInputWithLabel;
