/// file_path= src/pages/SignupPage.tsx
import React, { useState } from 'react';
import LoginWithGoogle from '../components/LoginWithGoogle';
import { useRootStore } from '../store/common/RootStoreContext';
import {
  LOCALSTORAGE_SYSTEM_USER_ID,
  getLocalStorageItem,
} from '../services/api/sessionService';
import BetaKeyAuth from '../components/admin/BetaKeyAuth';
import { TextComponent } from '../components/sb-core-ui-kit/TextComponent';

const SignupPage: React.FC = () => {
  const rootStore = useRootStore();
  rootStore.logoutSystemUser(
    getLocalStorageItem(LOCALSTORAGE_SYSTEM_USER_ID) || ''
  );

  const [isBetaKeyVerified, setIsBetaKeyVerified] = useState(false);

  const handleBetaKeySuccess = () => {
    setIsBetaKeyVerified(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="w-full pt-8 pb-0 px-12">
        <TextComponent
          text="Singularity Bridge"
          size="normal"
          align='right'
          className="font-bold"
        />
      </div>
      <div className="flex-grow flex flex-col items-center justify-center">
        {isBetaKeyVerified ? (
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
        ) : (
          <BetaKeyAuth onSuccess={handleBetaKeySuccess} />
        )}
      </div>
    </div>
  );
};

export { SignupPage };