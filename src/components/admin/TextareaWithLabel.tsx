import React, { useEffect } from 'react';
import { Input, initTE } from 'tw-elements';
import { useRootStore } from '../../store/common/RootStoreContext';
import { useTranslation } from 'react-i18next';

interface TextareaWithLabelProps {
  id: string;
  label: string;
  rows?: number;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

const TextareaWithLabel: React.FC<TextareaWithLabelProps> = ({
  id,
  label,
  rows = 10,
  placeholder = '',
  value,
  onChange,
}) => {
  const rootStore = useRootStore();
  const isHebrew = rootStore.language === 'he';
  const { t } = useTranslation();

  useEffect(() => {
    initTE({ Input });
  }, []);

  return (
    <div className="relative mb-3" data-te-input-wrapper-init>
      <textarea
        className={`peer m-0 block h-auto w-full rounded border border-solid border-neutral-300 bg-transparent bg-clip-padding px-3 py-4 text-base font-normal leading-tight text-neutral-700 transition duration-200 ease-linear placeholder:text-transparent focus:border-primary focus:pb-[0.625rem] focus:pt-[1.625rem] focus:text-neutral-700 focus:outline-none peer-focus:text-primary dark:border-neutral-600 dark:text-neutral-200 dark:focus:border-primary dark:peer-focus:text-primary [&:not(:placeholder-shown)]:pb-[0.625rem] [&:not(:placeholder-shown)]:pt-[1.625rem] ${isHebrew ? 'text-right' : 'text-left'}`}
        dir={isHebrew ? 'rtl' : 'ltr'}
        id={id}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      ></textarea>
      <label
        htmlFor={id}
        className={`pointer-events-none absolute top-0 origin-[0_0] border border-solid border-transparent px-3 py-4 text-neutral-500 transition-[opacity,_transform] duration-200 ease-linear peer-focus:-translate-y-2 peer-focus:translate-x-[0.15rem] peer-focus:scale-[0.85] peer-focus:text-primary peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:translate-x-[0.15rem] peer-[:not(:placeholder-shown)]:scale-[0.85] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary ${isHebrew ? 'right-0 text-right' : 'left-0 text-left'}`}
      >
        {t(label)}
      </label>
    </div>

    // <div className="relative mb-3" data-te-input-wrapper-init>
    //   <textarea
    //     className="peer m-0 block h-auto w-full rounded border border-solid border-neutral-300 bg-transparent bg-clip-padding px-3 py-4 text-base font-normal leading-tight text-neutral-700 transition duration-200 ease-linear placeholder:text-transparent focus:border-primary focus:pb-[0.625rem] focus:pt-[1.625rem] focus:text-neutral-700 focus:outline-none peer-focus:text-primary dark:border-neutral-600 dark:text-neutral-200 dark:focus:border-primary dark:peer-focus:text-primary [&:not(:placeholder-shown)]:pb-[0.625rem] [&:not(:placeholder-shown)]:pt-[1.625rem]"
    //     id={id}
    //     rows={rows}
    //     placeholder={placeholder}
    //     value={value}
    //     onChange={(e) => onChange(e.target.value)}
    //   ></textarea>
    //   <label
    //     htmlFor={id}
    //     className={`pointer-events-none absolute  ${isHebrew ? 'right-0' : 'left-0'} top-0 origin-[0_0] border border-solid border-transparent px-3 py-4 text-neutral-500 transition-[opacity,_transform] duration-200 ease-linear peer-focus:-translate-y-2 peer-focus:translate-x-[0.15rem] peer-focus:scale-[0.85] peer-focus:text-primary peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:translate-x-[0.15rem] peer-[:not(:placeholder-shown)]:scale-[0.85] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary`}
    //   >
    //     {t(label)}
    //   </label>
    // </div>
  );
};

export { TextareaWithLabel };
