import React, { useState } from 'react';
import { useEventEmitter } from '../../services/mittEmitter';
import {
  EVENT_CLOSE_MODAL,
  EVENT_SHOW_ADD_ACTION_MODAL,
  EVENT_SHOW_ADD_ASSISTANT_MODAL,
  EVENT_SHOW_ADD_COMPANY_MODAL,
  EVENT_SHOW_ADD_USER_MODAL,
  EVENT_SHOW_ADD_TEAM_MODAL,
  EVENT_SHOW_ADD_API_KEY_MODAL,
  EVENT_SHOW_ONBOARDING_MODAL,
  EVENT_SHOW_EDIT_ASSISTANT_ACTIONS_MODAL,
  EventType,
} from '../../utils/eventNames';
import { ModalDialog } from '../core/ModalDialog';
import {
  DialogComponentEventData,
  dialogComponentFactory,
} from '../../services/DialogFactory';

const DialogManager: React.FC = () => {

  const [isOpen, setIsOpen] = useState(false);
  const [dialogData, setDialogData] = useState<DialogComponentEventData>({
    component: <div>Hello</div>,
    title: 'Default Title',
    width: 'normal',
  });

  const updateContent = (
    eventType: EventType,
    eventData: any
  ) => {
    const newDialogData = dialogComponentFactory(eventType, eventData);
    setDialogData(newDialogData);
    setIsOpen(true);
  };

  useEventEmitter(
    EVENT_SHOW_ADD_ASSISTANT_MODAL,
    (eventData: any) =>
      updateContent(EVENT_SHOW_ADD_ASSISTANT_MODAL, eventData)
  );

  useEventEmitter(
    EVENT_SHOW_ADD_COMPANY_MODAL,
    (eventData: any) =>
      updateContent(EVENT_SHOW_ADD_COMPANY_MODAL, eventData)
  );

  useEventEmitter(
    EVENT_SHOW_ADD_ACTION_MODAL,
    (eventData: any) =>
      updateContent(EVENT_SHOW_ADD_ACTION_MODAL, eventData)
  );

  useEventEmitter(
    EVENT_SHOW_ADD_USER_MODAL,
    (eventData: any) =>
      updateContent(EVENT_SHOW_ADD_USER_MODAL, eventData)
  );

  useEventEmitter(
    EVENT_SHOW_ONBOARDING_MODAL,
    (eventData: any) => {
      updateContent(EVENT_SHOW_ONBOARDING_MODAL, eventData);
    }
  );

  useEventEmitter(
    EVENT_SHOW_EDIT_ASSISTANT_ACTIONS_MODAL,
    (eventData: any) => {
      updateContent(EVENT_SHOW_EDIT_ASSISTANT_ACTIONS_MODAL, eventData);
    }
  );
  
  useEventEmitter(
    EVENT_SHOW_ADD_TEAM_MODAL,
    (eventData: any) => {
      updateContent(EVENT_SHOW_ADD_TEAM_MODAL, eventData);
    }
  );

  useEventEmitter(
    EVENT_SHOW_ADD_API_KEY_MODAL,
    (eventData: any) => {
      updateContent(EVENT_SHOW_ADD_API_KEY_MODAL, eventData);
    }
  );

  useEventEmitter(EVENT_CLOSE_MODAL, () => {
    setIsOpen(false);    
  });

  return (
    <ModalDialog
      dialogData={dialogData}
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);        
      }}
    />
  );
};

export { DialogManager };
