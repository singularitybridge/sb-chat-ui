import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const LoginWithClerk: React.FC = () => {
  return (
    <SignIn
      routing="hash"
      signUpUrl="/signup"
      forceRedirectUrl="/admin/assistants"
      appearance={{
        elements: {
          rootBox: 'mx-auto',
          card: 'shadow-none bg-transparent',
        },
      }}
    />
  );
};

export default LoginWithClerk;
