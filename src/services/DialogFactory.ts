import { NewAssistantView } from '../pages/NewAssistantView';
import { NewCompanyView } from '../pages/NewCompanyView';
import { NewUserView } from '../pages/NewUserView';
import OnboardingDialog from '../pages/admin/Onboarding';
import {
  EVENT_SHOW_ADD_ASSISTANT_MODAL,
  EVENT_SHOW_ADD_COMPANY_MODAL,
  EVENT_SHOW_ADD_USER_MODAL,
  EVENT_SHOW_ONBOARDING_MODAL,
  EventType,
} from '../utils/eventNames';

import i18n from '../i18n';
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
        title: eventData.title || i18n.t('dialogTitles.newAssistant'),
        component: React.createElement(NewAssistantView),
      };

    case EVENT_SHOW_ADD_COMPANY_MODAL:
      return {
        title: eventData.title || i18n.t('dialogTitles.newCompany'),
        component: React.createElement(NewCompanyView),
      };

    case EVENT_SHOW_ADD_USER_MODAL:
      return {
        title: eventData.title || i18n.t('dialogTitles.newUser'),
        component: React.createElement(NewUserView),
      };

    case EVENT_SHOW_ONBOARDING_MODAL:
      return {
        title: eventData.title || i18n.t('dialogTitles.onboarding'),
        component: React.createElement(OnboardingDialog, { isOpen: true }),
      };

    default:
      return {
        title: '',
        component: React.createElement('div', {}, 'test'),
      };
  }
};

export { dialogComponentFactory };
