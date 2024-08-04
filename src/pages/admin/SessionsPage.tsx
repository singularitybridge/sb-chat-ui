import React from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../store/common/RootStoreContext';
import { Table } from '../../components/sb-core-ui-kit/Table';
import { toJS } from 'mobx';
import { withPage } from '../../components/admin/HOC/withPage';
import { convertToStringArray } from '../../utils/utils';
import { PlayIcon, TrashIcon } from '@heroicons/react/24/outline';
import { IconButton } from '../../components/admin/IconButton';
import { SessionKeys, ISession } from '../../store/models/Session';
import { EVENT_SHOW_NOTIFICATION } from '../../utils/eventNames';
import { emitter } from '../../services/mittEmitter';

const SessionsView: React.FC = observer(() => {
  const rootStore = useRootStore();
  const navigate = useNavigate();

  const headers: SessionKeys[] = [
    '_id',
    'assistantId',
  ];

  const handleDelete = (row: ISession) => {
    // rootStore.sessionStore.deleteSession(row._id);
  };

  const handleSetActiveSession = (row: ISession) => {
    rootStore.sessionStore.changeAssistant(row._id);
    emitter.emit(EVENT_SHOW_NOTIFICATION, 'Session set successfully');
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
    <>
      <Table
        headers={convertToStringArray(headers)}
        data={[]}
        Page="SessionsPage"
        onRowClick={(row: ISession) => navigate(`/admin/sessions/${row._id}`)}
        Actions={Actions}
      />
    </>
  );
});

const SessionsPage = withPage(
  'SessionsPage.title',
  'SessionsPage.description',
  () => {
    // emitter.emit(EVENT_SHOW_ADD_SESSION_MODAL, 'Add Session');
  }
)(SessionsView);
export { SessionsPage };
