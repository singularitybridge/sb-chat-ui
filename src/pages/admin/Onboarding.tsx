import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../store/common/RootStoreContext';
import { User } from '../../store/models/User';
import apiClient from '../../services/AxiosService';
import { Identifier } from '../../store/models/Assistant';
import { OnboardingStatus } from '../../store/models/RootStore';
import WizardProgress from '../../components/WizardProgress';
import OnboardingStep1 from '../../components/OnboardingStep1';
import OnboardingStep2 from '../../components/OnboardingStep2';
import OnboardingStep3 from '../../components/OnboardingStep3';
import { useTranslation } from 'react-i18next';

const OnboardingDialog: React.FC = observer(() => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const rootStore = useRootStore();
  const navigate = useNavigate();

  const mapServerResponseToUserModel = async (serverResponse: any) => {
    const newUser = await User.create({
      _id: serverResponse._id,
      name: serverResponse.name,
      nickname: '',
      email: serverResponse.email,
      googleId: serverResponse.googleId || '',
      role: serverResponse.role,
      companyId: serverResponse.companyId, 
      identifiers: serverResponse.identifiers.map((identifier: any) => Identifier.create({
        key: identifier.key,
        value: identifier.value,
        _id: identifier._id,
      }))
    });
    return newUser;
  };

  const handleOnboarding = async () => {
    try {
      const response = await apiClient.post('onboarding', { current_user: rootStore.currentUser });
      
      const { user, company, token } = response.data;
      
      localStorage.setItem('userToken', token);

      const userModelInstance = await mapServerResponseToUserModel(user);
      rootStore.setCurrentUser(userModelInstance);

      rootStore.updateOnboardingStatus(OnboardingStatus.USING_BASIC_FEATURES, []);
      rootStore.sessionStore.closeDialog();
      navigate('/admin/users');
    } catch (error) {
      console.error('Error during onboarding:', error);
      setError(t('Onboarding.errorFinishingOnboarding'));
    }
  };

  const handleStepComplete = (isComplete: boolean) => {
    if (isComplete) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        handleOnboarding();
      }
    }
  };

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
      
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
});

export default OnboardingDialog;
