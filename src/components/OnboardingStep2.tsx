import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextComponent } from './sb-core-ui-kit/TextComponent';
import { Input } from './sb-core-ui-kit/Input';

interface OnboardingStep2Props {
  onStepComplete: (isComplete: boolean) => void;
}

const OnboardingStep2: React.FC<OnboardingStep2Props> = ({
  onStepComplete,
}) => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    onStepComplete(!!apiKey);
  }, [apiKey, onStepComplete]);
  const { t } = useTranslation();

  return (
    <>
      <div className='p-4'>
        <img 
          src="/assets/onboarding/work.png" 
          alt={t('Onboarding.apiKey')} 
          className="w-full mb-6"
        />
      </div>
      <TextComponent
        text={t('Onboarding.enterOpenAIApiKey')}
        size="subtitle"
      />
      <TextComponent
        text={t('Onboarding.apiKeyDescription')}
        size="small"
      />

      <div className="mb-4">
        <label className="block text-gray-700 mb-2 font-bold" htmlFor="api-key">
          {t('Onboarding.openAIApiKey')}
        </label>
        <Input
          id="api-key"
          value={apiKey}
          onChange={setApiKey}
          placeholder={t('Onboarding.enterYourApiKey')}
          type="password"
        />
      </div>
    </>
  );
};

export default OnboardingStep2;

