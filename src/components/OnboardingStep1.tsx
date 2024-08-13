import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { useRootStore } from '../store/common/RootStoreContext';
import { TextComponent } from './sb-core-ui-kit/TextComponent';
import { TextareaWithLabel } from './sb-core-ui-kit/TextareaWithLabel';
import InputWithLabel from './sb-core-ui-kit/InputWithLabel';
import Button from './sb-core-ui-kit/Button';

interface OnboardingStep1Props {
  onStepComplete: (isComplete: boolean, data?: any) => void;
  updateCompanyInfo: (companyData: any) => Promise<boolean>;
}

const OnboardingStep1: React.FC<OnboardingStep1Props> = observer(({ onStepComplete, updateCompanyInfo }) => {
  const { t } = useTranslation();
  const rootStore = useRootStore();

  const [companyName, setCompanyName] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [userName, setUserName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const userSessionInfo = rootStore.authStore.userSessionInfo;
    setUserName(userSessionInfo.userName || '');

    const activeCompany = rootStore.activeCompany;
    if (activeCompany) {
      setCompanyName(activeCompany.name || '');
      setCompanyDescription(activeCompany.description || '');
    }
  }, [rootStore.authStore.userSessionInfo, rootStore.companies]);

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const success = await updateCompanyInfo({
        companyName,
        companyDescription,
        userName,
      });
      if (success) {
        if (rootStore.activeCompany) {
          rootStore.activeCompany.name = companyName;
          rootStore.activeCompany.description = companyDescription;
        }
        onStepComplete(true, { companyName, companyDescription, userName });
      } else {
        setError(t('Onboarding.errorUpdatingCompanyInfo'));
      }
    } catch (error) {
      console.error('Error updating company info:', error);
      setError(t('Onboarding.errorUpdatingCompanyInfo'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = !!companyName && !!companyDescription && !!userName;

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
      {error && <div className="text-red-500 mt-2">{error}</div>}
      <Button
        onClick={handleSubmit}
        disabled={!isFormValid || isSubmitting}
        additionalClassName="w-full mt-4"
      >
        {isSubmitting ? t('Onboarding.submitting') : t('Onboarding.continue')}
      </Button>
    </>
  );
});

export default OnboardingStep1;
