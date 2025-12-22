import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/useAuthStore';
import { useCompanyStore } from '../store/useCompanyStore';
import { useOnboardingStore, OnboardingStatus } from '../store/useOnboardingStore';
import { TextComponent } from './sb-core-ui-kit/TextComponent';
import { TextareaWithLabel } from './sb-core-ui-kit/TextareaWithLabel';
import InputWithLabel from './sb-core-ui-kit/InputWithLabel';
import Button from './sb-core-ui-kit/Button';
import { updateCompanyInfo } from '../services/api/companyService';

interface OnboardingStep1Props {
  onStepComplete: (isComplete: boolean) => void;
}

const OnboardingStep1: React.FC<OnboardingStep1Props> = (
  { onStepComplete }
) => {
  const { t } = useTranslation();
  const { userSessionInfo, loadUserSessionInfo } = useAuthStore();
  const { activeCompany, loadCompanies, companies } = useCompanyStore();
  const { updateOnboardingStatus } = useOnboardingStore();

  const [companyName, setCompanyName] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [userName, setUserName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setUserName(userSessionInfo.userName || '');

    if (activeCompany) {
      setCompanyName(activeCompany.name || '');
      setCompanyDescription(activeCompany.description || '');
    }
  }, [userSessionInfo, companies, activeCompany]);

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
        await loadUserSessionInfo();
        await loadCompanies();

        // Update onboarding status to API_KEY_REQUIRED
        await updateOnboardingStatus(OnboardingStatus.API_KEY_REQUIRED);

        onStepComplete(true);
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
};

export default OnboardingStep1;
