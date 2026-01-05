import React from 'react';
import { useNavigate } from 'react-router';
import { useUserStore } from '../../store/useUserStore';
import { Table } from '../../components/sb-core-ui-kit/Table';
import { UserKeys, IUser } from '../../types/entities';
import { convertToStringArray } from '../../utils/utils';
import { PlayIcon, TrashIcon } from '@heroicons/react/24/outline';
import { IconButton } from '../../components/admin/IconButton';
import { emitter } from '../../services/mittEmitter';
import {
  EVENT_SHOW_NOTIFICATION,
} from '../../utils/eventNames';
import AdminPageContainer from '../../components/admin/AdminPageContainer';
import { useTranslation } from 'react-i18next';

const UsersPage: React.FC = () => {
  const { users, deleteUser } = useUserStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const headers: UserKeys[] = ['name', 'nickname', 'email'];
  const handleDelete = (_row: IUser) => {
    deleteUser(_row._id);
  };

  const handleSetUser = async (_row: IUser) => {
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
    <AdminPageContainer>
      <h1 className="text-2xl font-semibold mb-2">{t('UsersPage.title')}</h1>
      <p className="text-gray-600 mb-6">{t('UsersPage.description')}</p>
      <Table
        headers={convertToStringArray(headers)}
        data={users}
        Page="UsersPage"
        onRowClick={(row: IUser) => navigate(`/admin/users/${row._id}`)}
        Actions={Actions}
      />
    </AdminPageContainer>
  );
};

export { UsersPage };
