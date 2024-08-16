import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../store/common/RootStoreContext';
import { OnboardingStatus } from '../../store/models/RootStore';
import WizardProgress from '../../components/WizardProgress';
import OnboardingStep1 from '../../components/OnboardingStep1';
import OnboardingStep2 from '../../components/OnboardingStep2';
import OnboardingStep3 from '../../components/OnboardingStep3';
import { useTranslation } from 'react-i18next';

interface OnboardingDialogProps {
  isOpen: boolean;
}

const OnboardingDialog: React.FC<OnboardingDialogProps> = observer(({ isOpen }) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const rootStore = useRootStore();
  const navigate = useNavigate();

  const handleStepComplete = (isComplete: boolean) => {
    if (isComplete) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        // Finish onboarding
        rootStore.updateOnboardingStatus();
        rootStore.sessionStore.setShowOnboarding(false);
        rootStore.sessionStore.closeDialog();
        navigate('/admin/users');
      }
    }
  };

  React.useEffect(() => {
    if (rootStore.onboardingStatus === OnboardingStatus.READY_FOR_ASSISTANTS) {
      rootStore.sessionStore.setShowOnboarding(false);
    }
  }, [rootStore.onboardingStatus]);

  if (!isOpen || !rootStore.sessionStore.showOnboarding || rootStore.onboardingStatus === OnboardingStatus.READY_FOR_ASSISTANTS) {
    return null;
  }

  return (
    <div className="p-4 w-full max-w-lg space-y-4">
      <WizardProgress totalSteps={3} currentStep={currentStep} />
      
      {currentStep === 1 && (
        <OnboardingStep1 
          onStepComplete={handleStepComplete} 
        />
      )}
      
      {currentStep === 2 && (
        <OnboardingStep2 onStepComplete={handleStepComplete} />
      )}

      {currentStep === 3 && (
        <OnboardingStep3 onStepComplete={handleStepComplete} />
      )}
    </div>
  );
});

export default OnboardingDialog;
