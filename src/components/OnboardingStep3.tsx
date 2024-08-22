import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextComponent } from './sb-core-ui-kit/TextComponent';
import Button from './sb-core-ui-kit/Button';
import { createDefaultAssistant } from '../services/api/assistantService';

interface OnboardingStep3Props {
  onStepComplete: (isComplete: boolean) => void;
}

const OnboardingStep3: React.FC<OnboardingStep3Props> = ({ onStepComplete }) => {
  const { t } = useTranslation();
  const [isCreating, setIsCreating] = useState(false);

  const handleContinue = async () => {
    setIsCreating(true);
    try {
      await createDefaultAssistant();
      onStepComplete(true);
    } catch (error) {
      console.error('Error creating default assistant:', error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <div className='p-4'>
        <img 
          src="/assets/onboarding/setup.png" 
          alt={t('Onboarding.createFirstAssistant')} 
          className="w-full mb-6"
        />
      </div>
      <TextComponent
        text={t('Onboarding.createFirstAssistantTitle')}
        size="subtitle"
      />
      <TextComponent
        text={t('Onboarding.createFirstAssistantDescription')}
        size="small"
      />
      <div className="mt-6">
        <Button
          onClick={handleContinue}
          additionalClassName="w-full bg-blue-500 hover:bg-blue-600"
          disabled={isCreating}
        >
          {isCreating ? t('Onboarding.creating') : t('Onboarding.continue')}
        </Button>
      </div>
    </>
  );
};

export default OnboardingStep3;