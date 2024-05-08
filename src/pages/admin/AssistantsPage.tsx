import React from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../store/common/RootStoreContext';
import { Table } from '../../components/Table';
import { toJS } from 'mobx';
import { AssistantKeys, IAssistant } from '../../store/models/Assistant';
import { withPage } from '../../components/admin/HOC/withPage';
import { convertToStringArray } from '../../utils/utils';
import {
  PlayIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { IconButton } from '../../components/admin/IconButton';
import { emitter } from '../../services/mittEmitter';
import { EVENT_SET_ACTIVE_ASSISTANT, EVENT_SHOW_ADD_ASSISTANT_MODAL } from '../../utils/eventNames';

const AssistantsView: React.FC = observer(() => {
  const rootStore = useRootStore();
  const navigate = useNavigate();

  const headers: AssistantKeys[] = ['name', 'description', 'voice'];

  const handleDelete = (row: IAssistant) => {
    rootStore.deleteAssistant(row._id);
  };

  const handleSetAssistant = async (row: IAssistant) => {    
    emitter.emit(EVENT_SET_ACTIVE_ASSISTANT, row._id);
  };

  const Actions = (row: IAssistant) => (
    <div className="flex space-x-2 items-center mx-1">
      <IconButton
        icon={<TrashIcon className="w-5 h-5  text-warning-900" />}
        onClick={(event) => {
          event.stopPropagation();
          handleDelete(row);
        }}
      />
      <IconButton
        icon={
          <PlayIcon className="w-5 h-5  text-warning-900" />
        }
        onClick={(event) => {
          event.stopPropagation();
          handleSetAssistant(row);
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
            data={toJS(rootStore.assistants)}
            Page='AssistantsPage'
            onRowClick={(row: IAssistant) =>
              navigate(`/admin/assistants/${row._id}`)
            }
            Actions={Actions}
          />
        </div>
        <div className=" flex-0 w-96">
          
        </div>
      </div>
    </>
  );
});

const AssistantsPage = withPage(
  'AI Assistants',
  'AssistantsPage.description',
  () => {
    emitter.emit(EVENT_SHOW_ADD_ASSISTANT_MODAL, 'Add Assistant');
  }
)(AssistantsView);
export { AssistantsPage };
