import React from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../store/common/RootStoreContext';
import { Table } from '../../components/Table';
import { toJS } from 'mobx';
import { withPage } from '../../components/admin/HOC/withPage';
import { convertToStringArray } from '../../utils/utils';
import { PlayIcon, TrashIcon } from '@heroicons/react/24/outline';
import { IconButton } from '../../components/admin/IconButton';
import { emitter } from '../../services/mittEmitter';
import {
  EVENT_SHOW_ADD_COMPANY_MODAL,
  EVENT_SHOW_NOTIFICATION,
} from '../../utils/eventNames';
import { CompanyKeys, ICompany } from '../../store/models/Company';
import {
  LOCALSTORAGE_COMPANY_ID,
  LOCALSTORAGE_USER_ID,
  getLocalStorageItem,
  getSessionById,
  setLocalStorageItem,
  createSession,
} from '../../services/api/sessionService';
import { TagsInput } from '../../components/InputTags';
import { useTranslation } from 'react-i18next';


const CompaniesView: React.FC = observer(() => {
  const rootStore = useRootStore();
  const navigate = useNavigate();

  const { t } = useTranslation();
  const headers: CompanyKeys[] = ['name', 'token'];

  const handleDelete = (row: ICompany) => {
    rootStore.deleteCompany(row._id);
  };

  const handleSetCompany = async (row: ICompany) => {
    setLocalStorageItem(LOCALSTORAGE_COMPANY_ID, row._id);
    const session = await createSession(
      getLocalStorageItem(LOCALSTORAGE_USER_ID) || '',
      row._id
    );
    const sessionData = await getSessionById(session._id);
    rootStore.sessionStore.setActiveSession(sessionData);
    rootStore.loadAssistants();
    rootStore.loadInboxMessages();

    emitter.emit(EVENT_SHOW_NOTIFICATION, t('CompaniesPage.successfullySet'));
  };

  const Actions = (row: ICompany) => (
    <div className="flex space-x-3 items-center mx-1">
      <IconButton
        icon={<TrashIcon className="w-5 h-5  text-warning-900" />}
        onClick={(event) => {
          event.stopPropagation();
          handleDelete(row);
        }}
      />
      <IconButton
        icon={<PlayIcon className="w-5 h-5  text-warning-900" />}
        onClick={(event) => {
          event.stopPropagation();
          handleSetCompany(row);
        }}
      />
    </div>
  );

  return (
    <>
      <TagsInput
        title={t("CompaniesPage.actionTitle")}
        description={t('CompaniesPage.action_msg')}
        selectedTags={[]}
        availableTags={[
          {
            id: 'add-user',
            name: t('CompaniesPage.actionTags.addUser'),
          },
          {
            id: 'remove-user',
            name: t('CompaniesPage.actionTags.removeUser'),
          },
        ]}
      />
      <div className="flex w-full justify-center">
        <div className=" flex-auto">
          <Table
            headers={convertToStringArray(headers)}
            data={toJS(rootStore.companies)}
            Page='CompaniesPage'
            onRowClick={(row: ICompany) =>
              navigate(`/admin/companies/${row._id}`)
            }
            Actions={Actions}
          />
        </div>
        <div className=" flex-0 w-96"></div>
      </div>
    </>
  );
});

const CompaniesPage = withPage('CompaniesPage.title', 'CompaniesPage.description', () => {
  emitter.emit(EVENT_SHOW_ADD_COMPANY_MODAL, 'Add Company');
})(CompaniesView);
export { CompaniesPage };
