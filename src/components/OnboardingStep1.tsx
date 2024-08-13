import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { useRootStore } from '../store/common/RootStoreContext';
import { TextComponent } from './sb-core-ui-kit/TextComponent';
import { TextareaWithLabel } from './sb-core-ui-kit/TextareaWithLabel';
import { updateCompanyInfo } from '../services/api/companyService';
import InputWithLabel from './sb-core-ui-kit/InputWithLabel';

interface OnboardingStep1Props {
  companyName: string;
  setCompanyName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  onNextStep: () => void;
}

const OnboardingStep1: React.FC<OnboardingStep1Props> = observer(({
  companyName,
  setCompanyName,
  description,
  setDescription,
  onNextStep,
}) => {
  const { t } = useTranslation();
  const rootStore = useRootStore();
  
  const [userNickname, setUserNickname] = useState(rootStore.authStore.userSessionInfo.userName);

  useEffect(() => {
    setUserNickname(rootStore.authStore.userSessionInfo.userName);
  }, [rootStore.authStore.userSessionInfo]);

  const handleNextStep = async () => {
    try {
      await updateCompanyInfo({
        companyName,
        companyDescription: description,
        userNickname,
      });
      onNextStep();
    } catch (error) {
      console.error('Error updating company info:', error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  return (
    <>
      <div className='p-4'>
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
      <TextComponent
        text={t('Onboarding.welcomeDescription')}
        size="small"
      />

      <InputWithLabel
        id="companyName"
        label={t('Onboarding.companyName')}
        value={companyName} onChange={function (value: string): void {
          throw new Error('Function not implemented.');
        } }        // onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompanyName(e.target.value)}
        // placeholder={t('Onboarding.enterYourCompanyName')}
      />

      <InputWithLabel
        id="userNickname"
        label={t('Onboarding.userNickname')}
        value={userNickname}
        // onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserNickname(e.target.value)}
        // placeholder={t('Onboarding.enterYourNickname')}
        disabled={true} onChange={function (value: string): void {
          throw new Error('Function not implemented.');
        } }      />

      <TextareaWithLabel
        id="description"
        label={t('Onboarding.tellUsAboutYourCompany')}
        value={description}
        onChange={setDescription}
        placeholder={t('Onboarding.tellUsAboutYourCompanyPlaceholder')}
      />

      <button onClick={handleNextStep} className="bg-blue-500 text-white px-4 py-2 rounded mt-4">
        {t('Onboarding.nextStep')}
      </button>
    </>
  );
});

export default OnboardingStep1;
