import React from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../store/common/RootStoreContext';
import { Table } from '../../components/Table';
import { toJS } from 'mobx';
import { UserKeys, IUser } from '../../store/models/User';
import { withPage } from '../../components/admin/HOC/withPage';
import { convertToStringArray } from '../../utils/utils';
import { TrashIcon } from '@heroicons/react/24/outline';
import { IconButton } from '../../components/admin/IconButton';
import { emitter } from '../../services/mittEmitter';
import { EVENT_SHOW_ADD_USER_MODAL } from '../../utils/eventNames';
// import { EVENT_SHOW_ADD_USER_MODAL } from '../../utils/eventNames';

const UsersView: React.FC = observer(() => {
  const rootStore = useRootStore();
  const navigate = useNavigate();

  const headers: UserKeys[] = ['name', 'nickname'];

  const handleDelete = (row: IUser) => {
    rootStore.deleteUser(row._id);
  };

  const Actions = (row: IUser) => (
    <div className="flex space-x-2 items-center mx-1">
      <IconButton
        icon={<TrashIcon className="w-5 h-5  text-warning-900" />}
        onClick={(event) => {
          event.stopPropagation();
          handleDelete(row);
        }}
      />
    </div>
  );

  return (
    <>
      <div className="flex w-full justify-center">
        <div className="flex-auto">
          <Table
            headers={convertToStringArray(headers)}
            data={toJS(rootStore.users)}
            onRowClick={(row: IUser) => navigate(`/admin/users/${row._id}`)}
            Actions={Actions}
          />
        </div>
        <div className="flex-0 w-96">
          {/* Additional UI elements can be added here */}
        </div>
      </div>
    </>
  );
});

const UsersPage = withPage(
  'Users',
  'manage your users here',
  () => {
    emitter.emit(EVENT_SHOW_ADD_USER_MODAL, 'Add User');
  }
)(UsersView);
export { UsersPage };
