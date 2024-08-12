
import React from 'react';
import { TextComponent } from './sb-core-ui-kit/TextComponent';
import Button from './sb-core-ui-kit/Button';

interface OnboardingStep3Props {
  onComplete: () => void;
}

const OnboardingStep3: React.FC<OnboardingStep3Props> = ({ onComplete }) => {
  return (
    <>
      <div className='p-4'>
        <img 
          src="/assets/onboarding/ready.png" 
          alt="AI Agent Ready" 
          className="w-full mb-6"
        />
      </div>
      <TextComponent
        text="סוכן AI חדש מחכה לך!"
        size="subtitle"
      />
      <TextComponent
        text="יצרנו סוכן AI מותאם אישית עבורך. הוא מוכן לעזור לך בכל משימה שתרצה!"
        size="small"
      />

      <Button
        onClick={onComplete}
        additionalClassName="w-full mt-6"
      >
        בואו נתחיל!
      </Button>
    </>
  );
};

export default OnboardingStep3;
