/// file_path: src/components/sb-chat-kit-ui/chat-elements/Header.tsx
import React, { useState, useEffect } from 'react';
import { CircleFadingPlus, Monitor, Settings, Copy, Code2 } from 'lucide-react';
import { Avatar, AvatarStyles, getAvatarUrl } from '../../Avatar';
import { useNavigate, useLocation } from 'react-router';
import { useSessionStore } from '../../../store/useSessionStore';
import { useAssistantStore } from '../../../store/useAssistantStore';
import { emitter } from '../../../services/mittEmitter';
import { EVENT_SHOW_NOTIFICATION } from '../../../utils/eventNames';
import { useTranslation } from 'react-i18next';
import { ModelIndicator } from '../../ModelIndicator';
import IntegrationIcons from '../../IntegrationIcons';
import CodeSampleDialog from '../../CodeSampleDialog';
import { getAssistantUrl } from '../../../utils/assistantUrlUtils';

interface HeaderProps {
  title: string;
  description: string;
  avatar: string;
  onClear: () => void;
  compact?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  description,
  avatar,
  onClear,
  compact = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [modelName, setModelName] = useState<string>('');
  const [integrations, setIntegrations] = useState<string[]>([]);
  const [showCodeSample, setShowCodeSample] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { activeSession } = useSessionStore();
  const { getAssistantById, loadAssistants, assistantsLoaded } = useAssistantStore();
  const { t } = useTranslation();

  // Check if we're in workspace mode
  const isInWorkspace = location.pathname.includes('/workspace');

  useEffect(() => {
    const loadAssistantData = async () => {
      if (!assistantsLoaded) {
        await loadAssistants();
      }
      
      if (activeSession?.assistantId) {
        const assistant = getAssistantById(activeSession.assistantId);
        if (assistant) {
          setModelName(assistant.llmModel);
          // Extract unique integration names from allowed actions
          const integrationNames = [...new Set(assistant.allowedActions.map((action) => action.split('.')[0]))];
          setIntegrations(integrationNames);
        }
      }
    };
    
    loadAssistantData();
  }, [activeSession?.assistantId, assistantsLoaded, loadAssistants, getAssistantById]);

  const toggleDescription = () => {
    setIsExpanded(!isExpanded);
  };

  const handleScreenShare = () => {
    // Navigate to assistant's workspace using assistant name
    if (activeSession?.assistantId) {
      const assistant = getAssistantById(activeSession.assistantId);
      if (assistant) {
        navigate(`/admin/assistants/${assistant.name}/workspace`);
      }
    }
  };

  const handleEditAssistant = () => {
    if (activeSession?.assistantId) {
      const assistant = getAssistantById(activeSession.assistantId);
      if (assistant) {
        navigate(getAssistantUrl(assistant));
      } else {
        // Fallback to ID if assistant not found in store
        navigate(`/admin/assistants/${activeSession.assistantId}`);
      }
    }
  };

  const handleCopyAssistantId = () => {
    if (activeSession?.assistantId) {
      navigator.clipboard.writeText(activeSession.assistantId)
        .then(() => {
          emitter.emit(EVENT_SHOW_NOTIFICATION, {
            message: t('AssistantsPage.copySuccess'),
            type: 'success',
          });
        })
        .catch((err) => {
          console.error('Failed to copy assistant ID:', err);
          emitter.emit(EVENT_SHOW_NOTIFICATION, {
            message: t('AssistantsPage.copyFailed'),
            type: 'error',
          });
        });
    }
  };

  const renderDescription = () => {
    if (description.length > 100 && !isExpanded) {
      return (
        <p
          className="text-sm text-[#6b7280] leading-4 "
          onClick={toggleDescription}
        >
          {`${description.substring(0, 97)}...`}
        </p>
      );
    }
    return (
      <p
        className="text-sm text-[#6b7280] leading-4"
        onClick={toggleDescription}
      >
        {description}
      </p>
    );
  };

  if (compact) {
    // Compact layout for narrow views (workspace)
    return (
      <>
        <div className="mb-4 p-3 border-b border-b-gray-200">
          <div className="flex items-start space-x-3 rtl:space-x-reverse">
            {/* Left: Avatar */}
            <Avatar
              avatarStyle={AvatarStyles.avatar}
              imageUrl={getAvatarUrl(avatar)}
              active={true}
            />

            {/* Right: Info stack */}
            <div className="flex-1 min-w-0">
              {/* Row 1: Name + Actions */}
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-base tracking-tight truncate">{title}</h2>
                <div className="flex items-center space-x-1 rtl:space-x-reverse shrink-0 ml-2">
                  <button
                    onClick={handleCopyAssistantId}
                    className="p-1 rounded-full transition-colors hover:bg-gray-100"
                    aria-label="Copy assistant ID"
                    title="Copy assistant ID"
                    disabled={!activeSession?.assistantId}
                  >
                    <Copy className="w-4 h-4 text-gray-500 hover:text-primary-600" />
                  </button>
                  <button
                    onClick={() => setShowCodeSample(true)}
                    className="p-1 rounded-full transition-colors hover:bg-gray-100"
                    aria-label="Show API code sample"
                    title="Show API code sample"
                    disabled={!activeSession?.assistantId}
                  >
                    <Code2 className="w-4 h-4 text-gray-500 hover:text-primary-600" />
                  </button>
                  <button
                    onClick={handleEditAssistant}
                    className="p-1 rounded-full transition-colors hover:bg-gray-100"
                    aria-label="Edit assistant"
                    title="Edit assistant"
                    disabled={!activeSession?.assistantId}
                  >
                    <Settings className="w-4 h-4 text-gray-500 hover:text-primary-600" />
                  </button>
                  {!isInWorkspace && (
                    <button
                      onClick={handleScreenShare}
                      className="p-1 rounded-full transition-colors hover:bg-gray-100"
                      aria-label="Share screen"
                      title="Share screen"
                    >
                      <Monitor className="w-4 h-4 text-gray-500 hover:text-primary-600" />
                    </button>
                  )}
                  <button
                    onClick={onClear}
                    className="p-1 rounded-full transition-colors hover:bg-gray-100"
                    aria-label="Clear chat"
                  >
                    <CircleFadingPlus className="w-4 h-4 text-gray-500 hover:text-primary-600" />
                  </button>
                </div>
              </div>

              {/* Row 2: Description */}
              {description && (
                <div className="mb-2">
                  <p className="text-xs text-[#6b7280] leading-4">
                    {description.length > 80 ? `${description.substring(0, 77)}...` : description}
                  </p>
                </div>
              )}

              {/* Row 3: Model */}
              {modelName && (
                <div className="mb-2">
                  <div className="inline-flex">
                    <ModelIndicator modelName={modelName} size="small" />
                  </div>
                </div>
              )}

              {/* Row 4: Integrations */}
              {integrations.length > 0 && (
                <div>
                  <IntegrationIcons integrations={integrations} />
                </div>
              )}
            </div>
          </div>
        </div>

        <CodeSampleDialog
          isOpen={showCodeSample}
          onClose={() => setShowCodeSample(false)}
        />
      </>
    );
  }

  // Normal layout for wider views
  return (
    <>
      <div className="flex justify-between items-start mb-4 p-3 border-b border-b-gray-200 space-x-4 rtl:space-x-reverse">
        {/* Left: Avatar */}
        <Avatar
          avatarStyle={AvatarStyles.medium}
          imageUrl={getAvatarUrl(avatar)}
          active={true}
        />

        {/* Center: Name, Description, Integrations */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
            <h2 className="font-semibold text-lg tracking-tight truncate">{title}</h2>
            {modelName && (
              <ModelIndicator modelName={modelName} size="small" />
            )}
          </div>

          {description && (
            <div className="mb-2">
              {renderDescription()}
            </div>
          )}

          {integrations.length > 0 && (
            <div>
              <IntegrationIcons integrations={integrations} />
            </div>
          )}
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center space-x-1 rtl:space-x-reverse shrink-0">
          <button
            onClick={handleCopyAssistantId}
            className="p-1 rounded-full transition-colors hover:bg-gray-100"
            aria-label="Copy assistant ID"
            title="Copy assistant ID"
            disabled={!activeSession?.assistantId}
          >
            <Copy className="w-5 h-5 text-gray-500 hover:text-primary-600" />
          </button>
          <button
            onClick={() => setShowCodeSample(true)}
            className="p-1 rounded-full transition-colors hover:bg-gray-100"
            aria-label="Show API code sample"
            title="Show API code sample"
            disabled={!activeSession?.assistantId}
          >
            <Code2 className="w-5 h-5 text-gray-500 hover:text-primary-600" />
          </button>
          <button
            onClick={handleEditAssistant}
            className="p-1 rounded-full transition-colors hover:bg-gray-100"
            aria-label="Edit assistant"
            title="Edit assistant"
            disabled={!activeSession?.assistantId}
          >
            <Settings className="w-5 h-5 text-gray-500 hover:text-primary-600" />
          </button>
          {!isInWorkspace && (
            <button
              onClick={handleScreenShare}
              className="p-1 rounded-full transition-colors hover:bg-gray-100"
              aria-label="Share screen"
              title="Share screen"
            >
              <Monitor className="w-5 h-5 text-gray-500 hover:text-primary-600" />
            </button>
          )}
          <button
            onClick={onClear}
            className="p-1 rounded-full transition-colors hover:bg-gray-100"
            aria-label="Clear chat"
          >
            <CircleFadingPlus className="w-5 h-5 text-gray-500 hover:text-primary-600" />
          </button>
        </div>
      </div>

      <CodeSampleDialog
        isOpen={showCodeSample}
        onClose={() => setShowCodeSample(false)}
      />
    </>
  );
};

export { Header };
