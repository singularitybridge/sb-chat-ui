import React from 'react';
import { TextComponent } from './sb-core-ui-kit/TextComponent';
import { Input } from './sb-core-ui-kit/Input';
import { Textarea } from './sb-core-ui-kit/Textarea';

interface OnboardingStep1Props {
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
}

const OnboardingStep1: React.FC<OnboardingStep1Props> = ({
  name,
  setName,
  description,
  setDescription,
}) => {
  return (
    <>
      <div className='p-4'>
        <img 
          src="/assets/onboarding/welcome.png" 
          alt="Welcome" 
          className="w-full mb-6"
        />
      </div>
      <TextComponent
        text="ברוכים הבאים ל Singularity Bridge AI Agent Portal"
        size="subtitle"
      />
      <TextComponent
        text="ברוכים הבאים למערכת המובילה שלנו בתחום המודלים הנוירלים, המיועדת לשנות את הדרך בה אתם מתקשרים עם טכנולוגיה. הפורטל שלנו מציע חוויה חלקה, המשלבת בין טכנולוגיית ניטור מתקדמת לבין ממשקי משתמש אינטואיטיביים."
        size="small"
      />

      <div className="mb-4">
        <label className="block text-gray-700 mb-2 font-bold" htmlFor="name">
          שם
        </label>
        <Input
          id="beta-key"
          value={name}
          onChange={setName}
          placeholder="הזינו את שמכם"
        />
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 mb-2 font-bold" htmlFor="description">
          ספרו לנו על עצמכם
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={setDescription}
          placeholder="ספרו לנו על עצמכם, במה אתם עוסקים?"
        />
      </div>
    </>
  );
};

export default OnboardingStep1;
