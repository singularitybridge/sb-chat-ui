import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanyStore } from '../../store/useCompanyStore';
import { useAssistantStore } from '../../store/useAssistantStore';
import { useInboxStore } from '../../store/useInboxStore';
import { Table } from '../../components/sb-core-ui-kit/Table';
import { convertToStringArray } from '../../utils/utils';
import { PlayIcon, TrashIcon } from '@heroicons/react/24/outline';
import { IconButton } from '../../components/admin/IconButton';
import { emitter } from '../../services/mittEmitter';
import {
  EVENT_SHOW_NOTIFICATION,
} from '../../utils/eventNames';
import { CompanyKeys, ICompany } from '../../types/entities';
import { useTranslation } from 'react-i18next';
import AdminPageContainer from '../../components/admin/AdminPageContainer';

const CompaniesPage: React.FC = () => {
  const { companies } = useCompanyStore();
  const { loadAssistants } = useAssistantStore();
  const { loadInboxSessions } = useInboxStore();
  const navigate = useNavigate();

  const { t } = useTranslation();
  const headers: CompanyKeys[] = ['name'];

  const handleDelete = (_row: ICompany) => {
    // Not implemented
  };

  const handleSetCompany = async (_row: ICompany) => {
    loadAssistants();
    loadInboxSessions();
    emitter.emit(EVENT_SHOW_NOTIFICATION, t('CompaniesPage.successfullySet'));
  };

  const Actions = (row: ICompany) => (
    <div className="flex space-x-3 items-center mx-1 rtl:space-x-reverse">
      <IconButton
        icon={<TrashIcon className="w-5 h-5 text-warning-900" />}
        onClick={(event) => {
          event.stopPropagation();
          handleDelete(row);
        }}
      />
      <IconButton
        icon={
          <PlayIcon className="w-5 h-5 text-warning-900 rtl:transform rtl:scale-x-[-1]" />
        }
        onClick={(event) => {
          event.stopPropagation();
          handleSetCompany(row);
        }}
      />
    </div>
  );

  return (
    <AdminPageContainer>
      <h1 className="text-2xl font-semibold mb-2">{t('CompaniesPage.title')}</h1>
      <p className="text-gray-600 mb-6">{t('CompaniesPage.description')}</p>
      <Table
        headers={convertToStringArray(headers)}
        data={companies.map(company => ({
          ...company,
          api_keys: company.api_keys?.length.toString() || '0',
          token: company.token ? '[Encrypted]' : ''
        }))}
        Page="CompaniesPage"
        onRowClick={(row: ICompany) => navigate(`/admin/companies/${row._id}`)}
        Actions={Actions}
      />
    </AdminPageContainer>
  );
};

export { CompaniesPage };
