import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextComponent } from './sb-core-ui-kit/TextComponent';
import InputWithLabel from './sb-core-ui-kit/InputWithLabel';
import { verifyApiKey } from '../services/apiKeyVerificationService';
import Button from './sb-core-ui-kit/Button';

interface OnboardingStep2Props {
  onStepComplete: (isComplete: boolean) => void;
}

const OnboardingStep2: React.FC<OnboardingStep2Props> = ({
  onStepComplete,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [buttonState, setButtonState] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const { t } = useTranslation();

  const handleVerify = async () => {
    setButtonState('verifying');
    setErrorMessage('');
    try {
      const isValid = await verifyApiKey(apiKey, 'openai_api_key'); // Use 'default' as apiKeyId for now
      if (isValid) {
        setButtonState('success');
        setTimeout(() => {
          onStepComplete(true);
        }, 1500);
      } else {
        setButtonState('error');
        setErrorMessage(t('Onboarding.apiKeyInvalid'));
      }
    } catch (error) {
      setButtonState('error');
      setErrorMessage(t('Onboarding.apiKeyVerificationError'));
    }
  };

  const getButtonText = () => {
    switch (buttonState) {
      case 'verifying':
        return t('Onboarding.verifying');
      case 'success':
        return t('Onboarding.apiKeyVerified');
      case 'error':
        return t('Onboarding.tryAgain');
      default:
        return t('Onboarding.continue');
    }
  };

  const getButtonColor = () => {
    switch (buttonState) {
      case 'success':
        return 'bg-green-500 hover:bg-green-600';
      case 'error':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  return (
    <>
      <div className="p-4">
        <img
          src="/assets/onboarding/work.png"
          alt={t('Onboarding.apiKey')}
          className="w-full mb-6"
        />
      </div>
      <TextComponent text={t('Onboarding.enterOpenAIApiKey')} size="subtitle" />
      <TextComponent text={t('Onboarding.apiKeyDescription')} size="small" />

      <div className="mb-4">
        <InputWithLabel
          label={t('Onboarding.apiKey')}
          id="api-key"
          value={apiKey}
          onChange={setApiKey}
          type="password"
        />
      </div>
      {errorMessage && (
        <div className="mb-4 text-red-500">{errorMessage}</div>
      )}
      <Button
        onClick={handleVerify}
        disabled={!apiKey || buttonState === 'verifying' || buttonState === 'success'}
        additionalClassName={`w-full transition-all duration-300 ${getButtonColor()}`}
      >
        {getButtonText()}
      </Button>
    </>
  );
};

export default OnboardingStep2;
