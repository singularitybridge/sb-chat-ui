import React, { useState, useMemo, useId } from 'react';
import { useCompanyStore } from '../../../store/useCompanyStore';
import { ICompany } from '../../../types/entities';
import {
  DynamicForm,
  FieldConfig,
  FormValues,
} from '../../../components/DynamicForm';
import { companyFieldConfigs } from '../../../store/fieldConfigs/companyFieldConfigs';
import { useTranslation } from 'react-i18next';
import { emitter } from '../../../services/mittEmitter';
import { EVENT_SHOW_NOTIFICATION } from '../../../utils/eventNames';
import { Button } from '../../../components/ui/button';

interface CompanyDetailsSectionProps {
  company: ICompany;
}

const CompanyDetailsSection: React.FC<CompanyDetailsSectionProps> = ({ company }) => {
  const { updateCompany } = useCompanyStore();
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const formId = useId();

  const formFields: FieldConfig[] = useMemo(() => {
    return companyFieldConfigs.map((config) => {
      const fieldKeyString = String(config.key);
      const fieldValue = company
        ? (company as any)[fieldKeyString]
        : config.value;

      return {
        ...config,
        value: fieldValue,
        options: (config as any).options || [],
      } as FieldConfig;
    });
  }, [company]);

  const handleSubmit = async (values: FormValues) => {
    setIsSaving(true);
    try {
      await updateCompany(company._id, values as unknown as ICompany);
      emitter.emit(EVENT_SHOW_NOTIFICATION, {
        message: t('EditCompanyPage.emitterMessage'),
        type: 'success',
      });
    } catch (error) {
      console.error('[CompanyDetailsSection] Error:', error);
      emitter.emit(EVENT_SHOW_NOTIFICATION, {
        message: t('common.saveFailed'),
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Header */}
      <div className="shrink-0 px-6 pt-6 pb-4 border-b border-border/50">
        <h1 className="text-2xl font-semibold">
          {t('EditCompanyPage.title')}
        </h1>
        <p className="text-muted-foreground mt-0.5">
          {t('EditCompanyPage.description')}
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-2xl">
          <DynamicForm
            formId={formId}
            fields={formFields}
            formContext="EditCompanyPage"
            onSubmit={handleSubmit}
            isLoading={isSaving}
            formType="update"
            hideSubmitButton={true}
          />
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="shrink-0 px-6 py-4 border-t border-border/50">
        <Button type="submit" form={formId} disabled={isSaving}>
          {isSaving ? t('common.pleaseWait') : t('common.save')}
        </Button>
      </div>
    </div>
  );
};

export { CompanyDetailsSection };
