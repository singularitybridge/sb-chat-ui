
import React from 'react';
import { useTranslation } from 'react-i18next';
import { TextComponent } from './sb-core-ui-kit/TextComponent';
import Button from './sb-core-ui-kit/Button';

interface OnboardingStep3Props {
  onComplete: () => void;
}

const OnboardingStep3: React.FC<OnboardingStep3Props> = ({ onComplete }) => {
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

      <Button
        onClick={onComplete}
        additionalClassName="w-full mt-6"
      >
        {t('Onboarding.letsStart')}
      </Button>
    </>
  );
};

export default OnboardingStep3;
