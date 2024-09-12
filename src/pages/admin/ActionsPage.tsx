import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ActionKeys, IAction } from '../../store/models/Action';
import { useRootStore } from '../../store/common/RootStoreContext';
import { IconButton } from '../../components/admin/IconButton';
import { TrashIcon } from '@heroicons/react/24/outline';
import { Table } from '../../components/sb-core-ui-kit/Table';
import { withPage } from '../../components/admin/HOC/withPage';
import { convertToStringArray } from '../../utils/utils';
import { toJS } from 'mobx';
import { EVENT_SHOW_ADD_ACTION_MODAL } from '../../utils/eventNames';
import { emitter } from '../../services/mittEmitter';
import { useNavigate } from 'react-router-dom';
import { TagsInput } from '../../components/InputTags';
import { useTranslation } from 'react-i18next';

const ActionsView: React.FC = observer(() => {
  const rootStore = useRootStore();
  const navigate = useNavigate();
  const headers: ActionKeys[] = ['_id', 'type', 'name', 'description'];
  const { t } = useTranslation();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleDelete = async (actionId: string) => {
    await rootStore.deleteAction(actionId);
  };

  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags);
    // You might want to do something with the selected tags here,
    // such as filtering the actions based on the selected tags
  };

  const ActionsColumn = (action: IAction) => (
    <div className="flex space-x-3 items-center">
      <IconButton
        icon={<TrashIcon className="w-5 h-5" />}
        onClick={() => handleDelete(action._id)}
      />
      {/* <IconButton icon={<EditIcon className="w-5 h-5" />} onClick={() => navigate(`/admin/actions/${action._id}`)} /> */}
    </div>
  );

  return (
    <div className="flex w-full justify-center">
      <div className="flex-auto">
        <TagsInput
          title={t('CompaniesPage.actionTitle')}
          description={t('CompaniesPage.action_msg')}
          selectedTags={selectedTags}
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
          onChange={handleTagsChange}
        />
        <Table
          headers={convertToStringArray(headers)}
          data={toJS(rootStore.actions)}
          Page="ActionsPage"
          Actions={ActionsColumn}
          onRowClick={(row: IAction) => navigate(`/admin/actions/${row._id}`)}
        />
      </div>
    </div>
  );
});

const ActionsPage = withPage(
  'ActionsPage.title',
  'ActionsPage.description',
  () => {
    emitter.emit(EVENT_SHOW_ADD_ACTION_MODAL, 'Add Action');
  }
)(ActionsView);
export { ActionsPage };
