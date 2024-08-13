
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TextComponent } from './sb-core-ui-kit/TextComponent';

interface OnboardingStep3Props {
  onStepComplete: (isComplete: boolean) => void;
}

const OnboardingStep3: React.FC<OnboardingStep3Props> = ({ onStepComplete }) => {
  useEffect(() => {
    onStepComplete(true);
  }, [onStepComplete]);
  const { t } = useTranslation();

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
    </>
  );
};

export default OnboardingStep3;
