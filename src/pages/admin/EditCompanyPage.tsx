import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';
import { useCompanyStore } from '../../store/useCompanyStore';
import { ICompany } from '../../types/entities';
import {
  DynamicForm,
  FieldConfig,
  FormValues,
} from '../../components/DynamicForm';
import { companyFieldConfigs } from '../../store/fieldConfigs/companyFieldConfigs';
import { useTranslation } from 'react-i18next';
import { PageLayout } from '../../components/admin/PageLayout';
import { TextComponent } from '../../components/sb-core-ui-kit/TextComponent';
import { emitter } from '../../services/mittEmitter';
import { EVENT_SHOW_NOTIFICATION } from '../../utils/eventNames';

const EditCompanyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { companiesLoaded, getCompanyById, updateCompany } = useCompanyStore();
  const [company, setCompany] = useState<ICompany | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { t } = useTranslation();

  const fetchCompany = async () => {
    if (id) {
      const fetchedCompany = getCompanyById(id);
      setCompany(fetchedCompany || null);
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, [id, companiesLoaded]);

  if (isInitialLoading) {
    return (
      <PageLayout variant="card">
        <TextComponent text={t('common.pleaseWait')} size="medium" />
      </PageLayout>
    );
  }

  if (!company) {
    return (
      <PageLayout variant="card">
        <TextComponent text="Company not found" size="medium" />
      </PageLayout>
    );
  }

  const formFields: FieldConfig[] = useMemo(() => {
    return companyFieldConfigs.map((config) => {
      const fieldKeyString = String(config.key);
      const fieldValue = company ? (company as any)[fieldKeyString] : config.value;

      return {
        ...config,
        value: fieldValue,
        options: (config as any).options || [],
      } as FieldConfig;
    });
  }, [company]);

  const handleSubmit = async (values: FormValues) => {
    if (!id) {
      return;
    }

    setIsSaving(true);
    try {
      await updateCompany(id, values as unknown as ICompany);
      emitter.emit(EVENT_SHOW_NOTIFICATION, {
        message: t('EditCompanyPage.emitterMessage'),
        type: 'success',
      });
    } catch (error) {
      console.error('[EditCompanyPage] Error:', error);
      emitter.emit(EVENT_SHOW_NOTIFICATION, {
        message: t('common.saveFailed'),
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageLayout
      variant="card"
      header={{
        title: t('EditCompanyPage.title'),
        description: t('EditCompanyPage.description'),
      }}
    >
      <div className="flex w-full space-x-12 rtl:space-x-reverse">
        <div className="w-1/2">
          <DynamicForm
            fields={formFields}
            formContext="EditCompanyPage"
            onSubmit={handleSubmit}
            isLoading={isSaving}
            formType="update"
          />
        </div>
        <div className="w-1/2">
          {/* Additional content can be added here if needed */}
        </div>
      </div>
    </PageLayout>
  );
};

export { EditCompanyPage };
