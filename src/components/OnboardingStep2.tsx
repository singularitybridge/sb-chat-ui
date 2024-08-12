import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextComponent } from './sb-core-ui-kit/TextComponent';
import { Input } from './sb-core-ui-kit/Input';
import Button from './sb-core-ui-kit/Button';

interface OnboardingStep2Props {
  apiKey: string;
  setApiKey: (apiKey: string) => void;
  onApiKeyVerified: () => void;
}

const OnboardingStep2: React.FC<OnboardingStep2Props> = ({
  apiKey,
  setApiKey,
  onApiKeyVerified,
}) => {
  const { t } = useTranslation();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const verifyApiKey = async () => {
    setIsVerifying(true);
    setVerificationError(null);

    try {
      // TODO: Implement actual API key verification logic here
      // For now, we'll simulate a successful verification after a short delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onApiKeyVerified();
    } catch (error) {
      setVerificationError(t('Onboarding.apiKeyVerificationFailed'));
    } finally {
      setIsVerifying(false);
    }
  };

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
      
      {verificationError && (
        <div className="text-red-500 mb-4">{verificationError}</div>
      )}

      <Button
        onClick={verifyApiKey}
        disabled={!apiKey || isVerifying}
        additionalClassName="w-full"
      >
        {isVerifying ? t('Onboarding.verifying') : t('Onboarding.verifyAndContinue')}
      </Button>
    </>
  );
};

export default OnboardingStep2;

