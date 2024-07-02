import React from 'react';
import { IconButton } from '../IconButton';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { TextComponent } from '../../sb-core-ui-kit/TextComponent';

const withPage =
  (title: string, description: string, onAction?: () => void) =>
    (WrappedComponent: React.ComponentType<any>) => {
      const WithPageComponent = (props: any) => {

        const { t } = useTranslation();

        return (
          <div className='bg-white rounded-xl p-4'>
            <div className="flex justify-between items-start space-x-3.5 rtl:space-x-reverse mb-3 bg-slate-100 p-3 rounded-2xl">
              <div>
                <TextComponent text={t(title)} size="subtitle" />
                <TextComponent text={t(description)} size="small" color="info" />
              </div>
              <div>
                {onAction && (
                  <IconButton
                    icon={<PlusCircleIcon className="w-6 h-6 text-stone-400" />}
                    onClick={onAction}
                    data-te-toggle="modal"
                    data-te-target="#exampleModal"
                  />
                )}
              </div>
            </div>
            <WrappedComponent {...props} />
          </div>
        );
      };

      WithPageComponent.displayName = `WithPage(${WrappedComponent.displayName || WrappedComponent.name || 'Component'
        })`;

      return WithPageComponent;
    };

export { withPage };
