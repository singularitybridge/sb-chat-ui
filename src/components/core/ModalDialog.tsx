import React from 'react';
import {
  TEModal,
  TEModalDialog,
  TEModalContent,
  TEModalHeader,
  TEModalBody,
} from 'tw-elements-react';

interface ModalDialogProps {
  title: string;
  onClose: () => void;
  onSave: () => void;
  isOpen: boolean;
  children: React.ReactNode;
}

const ModalDialog: React.FC<ModalDialogProps> = ({
  title,
  children,
  onClose,
  isOpen,
}) => {
  return (
    <TEModal show={isOpen} setShow={onClose}>
      <TEModalDialog>
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
          <TEModalBody>{children}</TEModalBody>
        </TEModalContent>
      </TEModalDialog>
    </TEModal>
  );
};

export { ModalDialog };
