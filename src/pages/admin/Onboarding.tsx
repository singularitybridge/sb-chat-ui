import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../store/common/RootStoreContext';
import { OnboardingStatus } from '../../store/models/RootStore';
import WizardProgress from '../../components/WizardProgress';
import OnboardingStep1 from '../../components/OnboardingStep1';
import OnboardingStep2 from '../../components/OnboardingStep2';
import OnboardingStep3 from '../../components/OnboardingStep3';
import OnboardingStep4 from '../../components/OnboardingStep4';
import { useTranslation } from 'react-i18next';
import { emitter } from '../../services/mittEmitter';
import { EVENT_CLOSE_MODAL } from '../../utils/eventNames';


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
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        // Finish onboarding
        emitter.emit(EVENT_CLOSE_MODAL);
        rootStore.updateOnboardingStatus();
        navigate('/admin/assistants');
      }
    }
  };

  return (
    <div className="p-4 w-full max-w-lg space-y-4">
      <WizardProgress totalSteps={4} currentStep={currentStep} />
      
      {currentStep === 1 && (
        <OnboardingStep1 onStepComplete={handleStepComplete} />
      )}
      
      {currentStep === 2 && (
        <OnboardingStep2 onStepComplete={handleStepComplete} />
      )}

      {currentStep === 3 && (
        <OnboardingStep3 onStepComplete={handleStepComplete} />
      )}

      {currentStep === 4 && (
        <OnboardingStep4 onStepComplete={handleStepComplete} />
      )}
    </div>
  );
});

export default OnboardingDialog;