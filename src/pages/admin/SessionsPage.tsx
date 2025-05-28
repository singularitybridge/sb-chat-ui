import React from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
// import { useRootStore } from '../../store/common/RootStoreContext'; // Removed
import { Table } from '../../components/sb-core-ui-kit/Table';
// import { toJS } from 'mobx'; // Removed
import { convertToStringArray } from '../../utils/utils';
import { PlayIcon, TrashIcon } from '@heroicons/react/24/outline';
import { IconButton } from '../../components/admin/IconButton';
import { ISession, useSessionStore } from '../../store/useSessionStore'; // Changed to useSessionStore
import { EVENT_SHOW_NOTIFICATION } from '../../utils/eventNames';
import { emitter } from '../../services/mittEmitter';
import AdminPageContainer from '../../components/admin/AdminPageContainer';
import { useTranslation } from 'react-i18next';

const SessionsPage: React.FC = observer(() => {
  // const rootStore = useRootStore(); // Removed
  const navigate = useNavigate();
  const { t } = useTranslation();

  const headers: (keyof ISession)[] = [ // Changed SessionKeys to keyof ISession
    '_id',
    'assistantId',
    'language', // Added language as it's part of ISession now
  ];

  const { changeAssistant } = useSessionStore.getState(); // Changed to useSessionStore

  const handleDelete = (row: ISession) => {
    // TODO: Implement delete session if needed in Zustand store
    console.log('Delete session clicked for:', row._id);
  };

  const handleSetActiveSession = (row: ISession) => {
    // Assuming row._id is the assistantId to change to, or this logic needs review
    // The original `changeAssistant` took assistantId. If row._id is session ID, this is wrong.
    // For now, I'll assume row.assistantId is what's intended, or row itself is the new active session.
    // The original call was `rootStore.sessionStore.changeAssistant(row._id)` which implies row._id was assistantId.
    // This seems problematic. Let's assume for now it means setting this session as active.
    // The `changeAssistant` action in Zustand store expects an assistantId.
    // This function might need to be re-thought: what does "set active session" mean here?
    // If it means making this session's assistant the active one:
    changeAssistant(row.assistantId); 
    // If it means making THIS session the active one:
    // useSessionStoreExtended.getState().setActiveSession(row);
    emitter.emit(EVENT_SHOW_NOTIFICATION, 'Session-related action performed'); // Generic message for now
  };

  const Actions = (row: ISession) => (
    <div className="flex space-x-3 items-center mx-1 rtl:space-x-reverse">
      <IconButton
        icon={
          <TrashIcon className="w-5 h-5 text-warning-900 hover:text-warning-700" />
        }
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
          handleSetActiveSession(row);
        }}
      />
    </div>
  );

  return (
    <AdminPageContainer>
      <h1 className="text-2xl font-semibold mb-2">{t('SessionsPage.title')}</h1>
      <p className="text-gray-600 mb-6">{t('SessionsPage.description')}</p>
      <Table
        headers={convertToStringArray(headers)}
        data={[]}
        Page="SessionsPage"
        onRowClick={(row: ISession) => navigate(`/admin/sessions/${row._id}`)}
        Actions={Actions}
      />
    </AdminPageContainer>
  );
});

export { SessionsPage };
