
import React from 'react';
import { useTranslation } from 'react-i18next';
import { TextComponent } from './sb-core-ui-kit/TextComponent';
import Button from './sb-core-ui-kit/Button';

interface OnboardingStep3Props {
  onStepComplete: (isComplete: boolean) => void;
}

const OnboardingStep3: React.FC<OnboardingStep3Props> = ({ onStepComplete }) => {
  const { t } = useTranslation();

  const handleContinue = () => {
    onStepComplete(true);
  };

  return (
    <>
      <div className='p-4'>
        <img 
          src="/assets/onboarding/ready.png" 
          alt={t('Onboarding.aiAgentReady')} 
          className="w-full mb-6"
        />
      </div>
      <TextComponent
        text={t('Onboarding.newAIAgentWaiting')}
        size="subtitle"
      />
      <TextComponent
        text={t('Onboarding.aiAgentDescription')}
        size="small"
      />
      <div className="mt-6">
        <Button
          onClick={handleContinue}
          additionalClassName="w-full bg-blue-500 hover:bg-blue-600"
        >
          {t('Onboarding.continue')}
        </Button>
      </div>
    </>
  );
};

export default OnboardingStep3;
