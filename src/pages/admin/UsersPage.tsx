import React from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../store/common/RootStoreContext';
import { Table } from '../../components/sb-core-ui-kit/Table';
import { toJS } from 'mobx';
import { UserKeys, IUser } from '../../store/models/User';
import { withPage } from '../../components/admin/HOC/withPage';
import { convertToStringArray } from '../../utils/utils';
import { PlayIcon, TrashIcon } from '@heroicons/react/24/outline';
import { IconButton } from '../../components/admin/IconButton';
import { emitter } from '../../services/mittEmitter';
import {
  EVENT_SHOW_ADD_USER_MODAL,
  EVENT_SHOW_NOTIFICATION,
} from '../../utils/eventNames';

const UsersView: React.FC = observer(() => {
  const rootStore = useRootStore();
  const navigate = useNavigate();

  const headers: UserKeys[] = ['name', 'nickname', 'email'];
  const handleDelete = (row: IUser) => {
    rootStore.deleteUser(row._id);
  };

  const handleSetUser = async (row: IUser) => {
    emitter.emit(EVENT_SHOW_NOTIFICATION, 'User set successfully');
  };

  const Actions = (row: IUser) => (
    <div className="flex space-x-3 items-center mx-1 rtl:space-x-reverse">
      <IconButton
        icon={<TrashIcon className="w-5 h-5  text-warning-900" />}
        onClick={(event) => {
          event.stopPropagation();
          handleDelete(row);
        }}
      />
      <IconButton
        icon={<PlayIcon className="w-5 h-5 text-warning-900 rtl:transform rtl:scale-x-[-1]" />}
        onClick={(event) => {
          event.stopPropagation();
          handleSetUser(row);
        }}
      />
    </div>
  );

  return (
    <>
      <Table
        headers={convertToStringArray(headers)}
        data={toJS(rootStore.users)}
        Page="UsersPage"
        onRowClick={(row: IUser) => navigate(`/admin/users/${row._id}`)}
        Actions={Actions}
      />
    </>
  );
});

const UsersPage = withPage('UsersPage.title', 'UsersPage.description', () => {
  emitter.emit(EVENT_SHOW_ADD_USER_MODAL, 'Add User');
})(UsersView);
export { UsersPage };
