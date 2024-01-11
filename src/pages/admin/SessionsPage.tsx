import React from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../store/common/RootStoreContext';
import { Table } from '../../components/Table';
import { toJS } from 'mobx';
import { withPage } from '../../components/admin/HOC/withPage';
import { convertToStringArray } from '../../utils/utils';
import {
  ChatBubbleLeftEllipsisIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { IconButton } from '../../components/admin/IconButton';
import { emitter } from '../../services/mittEmitter';
// import { EVENT_SHOW_ADD_SESSION_MODAL } from '../../utils/eventNames';
import { SessionKeys, ISession } from '../../store/models/Session';
import { deleteSession } from '../../services/api/sessionService';

const SessionsView: React.FC = observer(() => {
  const rootStore = useRootStore();
  const navigate = useNavigate();

  const headers: SessionKeys[] = ['userName', 'assistantName', 'threadId', 'active'];

  const handleDelete = (row: ISession) => {    
    deleteSession(row._id);
  };

  const handleSetActiveSession = (row: ISession) => {
    console.log('set active session', row);
    // emitter.emit(EVENT_SET_ACTIVE_SESSION, row._id);
  };

  const Actions = (row: ISession) => (
    <div className="flex space-x-2 items-center mx-1">
      <IconButton
        icon={<TrashIcon className="w-5 h-5 text-warning-900" />}
        onClick={(event) => {
          event.stopPropagation();
          handleDelete(row);
        }}
      />
      <IconButton
        icon={
          <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-warning-900" />
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
      <div className="flex w-full justify-center">
        <div className=" flex-auto">
          <Table
            headers={convertToStringArray(headers)}
            data={toJS(rootStore.sessions)}
            onRowClick={(row: ISession) =>
              navigate(`/admin/sessions/${row._id}`)
            }
            Actions={Actions}
          />
        </div>
        <div className=" flex-0 w-96">
          {/* Additional UI elements can be added here */}
        </div>
      </div>
    </>
  );
});

const SessionsPage = withPage(
  'Sessions',
  'list of sessions',
  () => {
    // emitter.emit(EVENT_SHOW_ADD_SESSION_MODAL, 'Add Session');
  }
)(SessionsView);
export { SessionsPage };
