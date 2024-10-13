import React from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../store/common/RootStoreContext';
import { Table } from '../../components/sb-core-ui-kit/Table';
import { toJS } from 'mobx';
import { convertToStringArray } from '../../utils/utils';
import { PlayIcon, TrashIcon } from '@heroicons/react/24/outline';
import { IconButton } from '../../components/admin/IconButton';
import { emitter } from '../../services/mittEmitter';
import {
  EVENT_SHOW_ADD_COMPANY_MODAL,
  EVENT_SHOW_NOTIFICATION,
} from '../../utils/eventNames';
import { CompanyKeys, ICompany } from '../../store/models/Company';
import { useTranslation } from 'react-i18next';
import AdminPageContainer from '../../components/admin/AdminPageContainer';

const CompaniesPage: React.FC = observer(() => {
  const rootStore = useRootStore();
  const navigate = useNavigate();

  const { t } = useTranslation();
  const headers: CompanyKeys[] = ['name'];

  const handleDelete = (row: ICompany) => {
    // rootStore.deleteCompany(row._id);
  };

  const handleSetCompany = async (row: ICompany) => {
    rootStore.loadAssistants();
    rootStore.loadInboxMessages();
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
        data={toJS(rootStore.companies).map(company => ({
          ...company,
          api_keys: company.api_keys.length.toString(), // Convert to string to display count
          token: company.token ? '[Encrypted]' : ''
        }))}
        Page="CompaniesPage"
        onRowClick={(row: ICompany) => navigate(`/admin/companies/${row._id}`)}
        Actions={Actions}
      />
    </AdminPageContainer>
  );
});

export { CompaniesPage };
