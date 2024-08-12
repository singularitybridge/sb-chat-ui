import React, { useState } from 'react';
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
      setVerificationError('Failed to verify API key. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      <div className='p-4'>
        <img 
          src="/assets/onboarding/work.png" 
          alt="API Key" 
          className="w-full mb-6"
        />
      </div>
      <TextComponent
        text="הזינו את מפתח ה-API של OpenAI"
        size="subtitle"
      />
      <TextComponent
        text="כדי להשתמש במערכת, אנחנו זקוקים למפתח ה-API של OpenAI שלכם. זה מאפשר לנו לתקשר עם המודלים של OpenAI בשמכם."
        size="small"
      />

      <div className="mb-4">
        <label className="block text-gray-700 mb-2 font-bold" htmlFor="api-key">
          מפתח API של OpenAI
        </label>
        <Input
          id="api-key"
          value={apiKey}
          onChange={setApiKey}
          placeholder="הזינו את מפתח ה-API שלכם"
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
        {isVerifying ? 'מאמת...' : 'בדוק ועבור לשלב הבא'}
      </Button>
    </>
  );
};

export default OnboardingStep2;

