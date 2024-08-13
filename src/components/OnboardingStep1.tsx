import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { useRootStore } from '../store/common/RootStoreContext';
import { TextComponent } from './sb-core-ui-kit/TextComponent';
import { TextareaWithLabel } from './sb-core-ui-kit/TextareaWithLabel';
import { updateCompanyInfo } from '../services/api/companyService';
import InputWithLabel from './sb-core-ui-kit/InputWithLabel';

interface OnboardingStep1Props {
  onNextStep: () => void;
}

const OnboardingStep1: React.FC<OnboardingStep1Props> = observer(
  ({ onNextStep }) => {
    const { t } = useTranslation();
    const rootStore = useRootStore();

    const [companyName, setCompanyName] = useState('');
    const [companyDescription, setCompanyDescription] = useState('');
    const [userName, setUserName] = useState(
      rootStore.authStore.userSessionInfo.userName
    );

    useEffect(() => {
      setUserName(rootStore.authStore.userSessionInfo.userName);
    }, [rootStore.authStore.userSessionInfo]);

    const handleNextStep = async () => {
      try {
        await updateCompanyInfo({
          companyName,
          companyDescription,
          userName,
        });
        onNextStep();
      } catch (error) {
        console.error('Error updating company info:', error);
        // Handle error (e.g., show an error message to the user)
      }
    };

    return (
      <>
        <div className="p-4">
          <img
            src="/assets/onboarding/welcome.png"
            alt={t('Onboarding.welcome')}
            className="w-full mb-6"
          />
        </div>
        <TextComponent
          text={t('Onboarding.welcomeToSingularityBridge')}
          size="subtitle"
        />
        <TextComponent text={t('Onboarding.welcomeDescription')} size="small" />

        <InputWithLabel
          id="companyName"
          label={t('Onboarding.companyName')}
          value={companyName}
          onChange={(value: string) => setCompanyName(value)}
        />

        <InputWithLabel
          id="userName"
          label={t('Onboarding.userName')}
          value={userName}
          onChange={(value: string) => setUserName(value)}
        />

        <TextareaWithLabel
          id="description"
          label={t('Onboarding.tellUsAboutYourCompany')}
          value={companyDescription}
          onChange={(value: string) => setCompanyDescription(value)}
          placeholder={t('Onboarding.tellUsAboutYourCompanyPlaceholder')}
        />

        <button
          onClick={handleNextStep}
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
        >
          {t('Onboarding.nextStep')}
        </button>
      </>
    );
  }
);

export default OnboardingStep1;
