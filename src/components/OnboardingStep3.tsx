import React from 'react';
import { TextComponent } from './sb-core-ui-kit/TextComponent';

interface OnboardingStep3Props {
  name: string;
  description: string;
  apiKey: string;
}

const OnboardingStep3: React.FC<OnboardingStep3Props> = ({
  name,
  description,
  apiKey,
}) => {
  return (
    <>
      <div className='p-4'>
        <img 
          src="/assets/onboarding/summary.png" 
          alt="Summary" 
          className="w-full mb-6"
        />
      </div>
      <TextComponent
        text="סיכום"
        size="subtitle"
      />
      <TextComponent
        text="להלן סיכום הפרטים שהזנתם:"
        size="small"
      />

      <div className="mb-4">
        <p><strong>שם:</strong> {name}</p>
        <p><strong>תיאור:</strong> {description}</p>
        <p><strong>מפתח API:</strong> {apiKey.substring(0, 5)}...{apiKey.substring(apiKey.length - 5)}</p>
      </div>
      <TextComponent
        text="אנא ודאו שכל הפרטים נכונים לפני שתסיימו את תהליך ההרשמה."
        size="small"
      />
    </>
  );
};

export default OnboardingStep3;
