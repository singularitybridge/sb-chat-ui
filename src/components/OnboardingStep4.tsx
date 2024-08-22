import React from 'react';
import { useTranslation } from 'react-i18next';
import { TextComponent } from './sb-core-ui-kit/TextComponent';
import Button from './sb-core-ui-kit/Button';

interface OnboardingStep4Props {
  onStepComplete: (isComplete: boolean) => void;
}

const OnboardingStep4: React.FC<OnboardingStep4Props> = ({ onStepComplete }) => {
  const { t } = useTranslation();

  const handleFinish = () => {
    onStepComplete(true);
  };

  return (
    <>
      <div className='p-4'>
        <img 
          src="/assets/onboarding/ready.png" 
          alt={t('Onboarding.readyToGo')} 
          className="w-full mb-6"
        />
      </div>
      <TextComponent
        text={t('Onboarding.readyToGoTitle')}
        size="subtitle"
      />
      <TextComponent
        text={t('Onboarding.readyToGoDescription')}
        size="small"
      />
      <div className="mt-6">
        <Button
          onClick={handleFinish}
          additionalClassName="w-full bg-green-500 hover:bg-green-600"
        >
          {t('Onboarding.finish')}
        </Button>
      </div>
    </>
  );
};

export default OnboardingStep4;