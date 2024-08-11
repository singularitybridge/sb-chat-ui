import React from 'react';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../store/common/RootStoreContext';
import OnboardingDialog from '../pages/admin/Onboarding';

const DialogManager: React.FC = observer(() => {
  const rootStore = useRootStore();
  const { sessionStore } = rootStore;

  if (sessionStore.isDialogOpen('onboardingDialog')) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl">
          <OnboardingDialog />
        </div>
      </div>
    );
  }

  return null;
});

export default DialogManager;