import { NewAssistantView } from '../pages/NewAssistantView';
import { NewCompanyView } from '../pages/NewCompanyView';
import { EVENT_SHOW_ADD_ASSISTANT_MODAL, EVENT_SHOW_ADD_COMPANY_MODAL, EventType } from '../utils/eventNames';
import React from 'react';

export interface DialogComponentEventData {
  title: string;
  component: React.ReactElement;
}

const dialogComponentFactory = (
  eventType: EventType,
  eventData: DialogComponentEventData
): { title: string; component: React.ReactElement } => {
  switch (eventType) {
    case EVENT_SHOW_ADD_ASSISTANT_MODAL:
      return {
        title: eventData.title || 'Create New Assistant',
        component: React.createElement(NewAssistantView),
      };

    case EVENT_SHOW_ADD_COMPANY_MODAL:
      return {
        title: eventData.title || 'Create New Company',
        component: React.createElement(NewCompanyView),
      };

    default:
      return {
        title: '',
        component: React.createElement('div', {}, 'test'),
      };
  }
};

export { dialogComponentFactory };
