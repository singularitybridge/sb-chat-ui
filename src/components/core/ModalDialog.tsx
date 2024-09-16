import React from 'react';
import {
  TEModal,
  TEModalDialog,
  TEModalContent,
  TEModalHeader,
  TEModalBody,
} from 'tw-elements-react';
import { DialogComponentEventData } from '../../services/DialogFactory';

interface ModalDialogProps {
  dialogData: DialogComponentEventData;
  onClose: () => void;
  isOpen: boolean;
}

const ModalDialog: React.FC<ModalDialogProps> = ({
  dialogData,
  onClose,
  isOpen,
}) => {
  const { title, component, width = 'normal' } = dialogData;

  return (
    <TEModal show={isOpen} setShow={onClose}>
      <TEModalDialog size={width === 'wide' ? 'lg' : undefined}>
        <TEModalContent>
          <TEModalHeader>
            <h5 className="text-xl font-medium leading-normal text-neutral-800 dark:text-neutral-200">
              {title}
            </h5>

            <button
              type="button"
              className="box-content rounded-none border-none hover:no-underline hover:opacity-75 focus:opacity-100 focus:shadow-none focus:outline-none"
              onClick={onClose}
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </TEModalHeader>
          <TEModalBody>{component}</TEModalBody>
        </TEModalContent>
      </TEModalDialog>
    </TEModal>
  );
};

export { ModalDialog };
