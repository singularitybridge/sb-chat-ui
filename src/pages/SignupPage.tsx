/// file_path= src/pages/SignupPage.tsx
import React from 'react';
import LoginWithGoogle from '../components/LoginWithGoogle';
import { TextComponent } from '../components/sb-core-ui-kit/TextComponent';

const SignupPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <div className="w-full pt-8 pb-0 px-12">
        <TextComponent
          text="Singularity Bridge"
          size="normal"
          align='right'
          className="font-bold"
        />
      </div>
      <div className="grow flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <img
            src="assets/sb-welcome.png"
            className="mb-2 mx-auto"
            alt="Welcome"
          />
          <TextComponent
            text="כניסה ל- Singularity Bridge"
            size="title"
            className="mb-2"
          />

          <div className="flex justify-center mt-10">
            <LoginWithGoogle />
          </div>
        </div>
      </div>
    </div>
  );
};

export { SignupPage };