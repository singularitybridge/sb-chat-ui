import React from 'react';
import { useTranslation } from 'react-i18next';
import { TextComponent } from './sb-core-ui-kit/TextComponent';
import { Input } from './sb-core-ui-kit/Input';
import { Textarea } from './sb-core-ui-kit/Textarea';

interface OnboardingStep1Props {
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
}

const OnboardingStep1: React.FC<OnboardingStep1Props> = ({
  name,
  setName,
  description,
  setDescription,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div className='p-4'>
        <img 
          src="/assets/onboarding/welcome.png" 
          alt={t('Onboarding.welcome')} 
          className="w-full mb-6"
        />
      </div>
      <TextComponent
        text={t('Onboarding.welcomeToSingularityBridge')}
        size="subtitle"
      />
      <TextComponent
        text={t('Onboarding.welcomeDescription')}
        size="small"
      />

      <div className="mb-4">
        <label className="block text-gray-700 mb-2 font-bold" htmlFor="name">
          {t('Onboarding.name')}
        </label>
        <Input
          id="name"
          value={name}
          onChange={setName}
          placeholder={t('Onboarding.enterYourName')}
        />
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 mb-2 font-bold" htmlFor="description">
          {t('Onboarding.tellUsAboutYourself')}
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={setDescription}
          placeholder={t('Onboarding.tellUsAboutYourselfPlaceholder')}
        />
      </div>
    </>
  );
};

export default OnboardingStep1;
