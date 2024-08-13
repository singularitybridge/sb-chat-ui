//File: src/pages/admin/Onboarding.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../store/common/RootStoreContext';
import { User } from '../../store/models/User';
import Button from '../../components/sb-core-ui-kit/Button';
import apiClient from '../../services/AxiosService';
import { Identifier } from '../../store/models/Assistant';
import { OnboardingStatus } from '../../store/models/RootStore';
import WizardProgress from '../../components/WizardProgress';
import OnboardingStep1 from '../../components/OnboardingStep1';
import OnboardingStep2 from '../../components/OnboardingStep2';
import OnboardingStep3 from '../../components/OnboardingStep3';

const OnboardingDialog: React.FC = observer(() => {
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [apiKey, setApiKey] = useState('');
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
      const response = await apiClient.post('onboarding', { current_user: rootStore.currentUser, name, description });
      
      const { user, company, token } = response.data;
      
      localStorage.setItem('userToken', token);

      const userModelInstance = await mapServerResponseToUserModel(user);
      rootStore.setCurrentUser(userModelInstance);

      rootStore.updateOnboardingStatus(OnboardingStatus.USING_BASIC_FEATURES, []);
      rootStore.sessionStore.closeDialog();
      navigate('/admin/users');
    } catch (error) {
      console.error('Error during onboarding:', error);
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="p-4 w-full max-w-lg space-y-4">
      <WizardProgress totalSteps={3} currentStep={currentStep} />
      
      {currentStep === 1 && (
        <OnboardingStep1 onNextStep={function (): void {
          throw new Error('Function not implemented.');
        } }        />
      )}
      
      {currentStep === 2 && (
        <OnboardingStep2
          apiKey={apiKey}
          setApiKey={setApiKey} onApiKeyVerified={function (): void {
            throw new Error('Function not implemented.');
          } }        />
      )}

      {currentStep === 3 && (
        <OnboardingStep3 onComplete={function (): void {
          throw new Error('Function not implemented.');
        } }        />
      )}
      
      <div className="flex justify-between">
        <Button onClick={handlePrevious} disabled={currentStep === 1}>
          הקודם
        </Button>
        <Button onClick={handleNext} isArrowButton={true} disabled={currentStep === 1 && (description === '' || name === '')}>
          {currentStep === 3 ? 'סיום' : 'הבא'}
        </Button>
      </div>
    </div>
  );
});

export default OnboardingDialog;
