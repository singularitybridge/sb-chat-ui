import React, { useState } from 'react';
import { useEventEmitter } from '../../services/mittEmitter';
import {
  EVENT_CLOSE_MODAL,
  EVENT_SHOW_ADD_ACTION_MODAL,
  EVENT_SHOW_ADD_ASSISTANT_MODAL,
  EVENT_SHOW_ADD_COMPANY_MODAL,
  EVENT_SHOW_ADD_USER_MODAL,
  EVENT_SHOW_ONBOARDING_MODAL,
  EventType,
} from '../../utils/eventNames';
import { ModalDialog } from '../core/ModalDialog';
import {
  DialogComponentEventData,
  dialogComponentFactory,
} from '../../services/DialogFactory';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../store/common/RootStoreContext';

const DialogManager = observer(() => {
  const rootStore = useRootStore();
  const [isOpen, setIsOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({
    component: <div>Hello</div>,
    title: 'Default Title',
  });

  const updateContent = (
    eventType: EventType,
    eventData: DialogComponentEventData
  ) => {
    const { component, title } = dialogComponentFactory(eventType, eventData);
    setDialogContent({ component, title });
    setIsOpen(true);
  };

  useEventEmitter(
    EVENT_SHOW_ADD_ASSISTANT_MODAL,
    (eventData: DialogComponentEventData) =>
      updateContent(EVENT_SHOW_ADD_ASSISTANT_MODAL, eventData)
  );

  useEventEmitter(
    EVENT_SHOW_ADD_COMPANY_MODAL,
    (eventData: DialogComponentEventData) =>
      updateContent(EVENT_SHOW_ADD_COMPANY_MODAL, eventData)
  );

  useEventEmitter(
    EVENT_SHOW_ADD_ACTION_MODAL,
    (eventData: DialogComponentEventData) =>
      updateContent(EVENT_SHOW_ADD_ACTION_MODAL, eventData)
  );

  useEventEmitter(
    EVENT_SHOW_ADD_USER_MODAL,
    (eventData: DialogComponentEventData) =>
      updateContent(EVENT_SHOW_ADD_USER_MODAL, eventData)
  );

  useEventEmitter(
    EVENT_SHOW_ONBOARDING_MODAL,
    (eventData: DialogComponentEventData) => {
      console.log('EVENT_SHOW_ONBOARDING_MODAL');
      updateContent(EVENT_SHOW_ONBOARDING_MODAL, eventData);
    }
      
  );

  useEventEmitter(EVENT_CLOSE_MODAL, () => {
    setIsOpen(false);    
  });

  return (
    <ModalDialog
      title={dialogContent.title}
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);        
      }}
      onSave={() => {}}
    >
      {dialogContent.component}
    </ModalDialog>
  );
});

export { DialogManager };
