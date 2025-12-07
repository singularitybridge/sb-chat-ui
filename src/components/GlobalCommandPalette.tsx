import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCommandPalette } from '../contexts/CommandPaletteContext';
import { useUnifiedSearch } from '../hooks/useUnifiedSearch';
import { IAssistant } from '../store/models/Assistant';
import { ITeam } from '../store/models/Team';
import { WorkspaceSearchItem } from '../contexts/CommandPaletteContext';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './ui/command';
import { Avatar, AvatarStyles } from './Avatar';
import { ModelIndicator } from './ModelIndicator';
import IntegrationIcons from './IntegrationIcons';
import { CornerDownLeft, FileText, Layers } from 'lucide-react';
import { getKeyboardShortcut } from '../config/commandPalette';
import { useSessionStore } from '../store/useSessionStore';

export const GlobalCommandPalette: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { changeAssistant } = useSessionStore();
  const [isChangingAssistant, setIsChangingAssistant] = React.useState(false);
  const {
    open,
    setOpen,
    assistants,
    teams,
    workspaceItems,
    isLoadingWorkspace,
  } = useCommandPalette();

  const { groupedResults, searchQuery, setSearchQuery } = useUnifiedSearch({
    assistants,
    teams,
    workspaceItems,
  });

  const handleSelectAssistant = useCallback(
    async (assistant: IAssistant) => {
      setIsChangingAssistant(true);
      try {
        await changeAssistant(assistant._id);
        navigate(`/admin/assistants/${assistant.name}/workspace`);
        setOpen(false);
      } catch (error) {
        console.error('Failed to change assistant:', error);
        // Still navigate even if the API call fails
        navigate(`/admin/assistants/${assistant.name}/workspace`);
        setOpen(false);
      } finally {
        setIsChangingAssistant(false);
      }
    },
    [changeAssistant, navigate, setOpen]
  );

  const handleSelectTeam = useCallback(
    (team: ITeam) => {
      navigate(`/admin/assistants/team/${team._id}`);
      setOpen(false);
    },
    [navigate, setOpen]
  );

  const handleSelectWorkspace = useCallback(
    (item: WorkspaceSearchItem) => {
      if (item.agentId && item.agentName) {
        // Navigate to workspace page with file path in URL
        // Ensure path starts with / for proper URL structure
        const normalizedPath = item.path.startsWith('/') ? item.path : `/${item.path}`;
        navigate(`/admin/assistants/${item.agentName}/workspace${normalizedPath}`);
      }
      setOpen(false);
    },
    [navigate, setOpen]
  );

  const extractIntegrationNames = (allowedActions: string[]): string[] => {
    return [...new Set(allowedActions.map((action) => action.split('.')[0]))];
  };

  const getWorkspaceItemTitle = (item: WorkspaceSearchItem): string => {
    return item.metadata?.title || item.path.split('/').pop() || item.path;
  };

  const getWorkspaceItemDescription = (item: WorkspaceSearchItem): string => {
    const parts: string[] = [];
    if (item.agentName) parts.push(item.agentName);
    if (item.metadata?.description) parts.push(item.metadata.description);
    else if (item.metadata?.contentType) parts.push(item.metadata.contentType);
    return parts.join(' • ');
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder={t('CommandPalette.searchPlaceholder', 'Search assistants, teams, workspace...')}
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>
          {isLoadingWorkspace
            ? t('CommandPalette.loading', 'Loading workspace items...')
            : t('CommandPalette.noResults', 'No results found.')}
        </CommandEmpty>

        {/* Assistants Group */}
        {groupedResults.assistants.length > 0 && (
          <>
            <CommandGroup heading={t('CommandPalette.assistants', 'Assistants')}>
              {groupedResults.assistants.map((result) => {
                const assistant = result.data as IAssistant;
                const integrationNames = extractIntegrationNames(assistant.allowedActions);
                return (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleSelectAssistant(assistant)}
                    className="flex items-center gap-3 py-3"
                  >
                    <div className="flex-shrink-0">
                      <Avatar
                        imageUrl={`/assets/avatars/${assistant.avatarImage}.png`}
                        avatarStyle={AvatarStyles.avatar}
                        active={false}
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-900 truncate">
                          {assistant.name}
                        </span>
                        <ModelIndicator modelName={assistant.llmModel} size="small" />
                      </div>
                      <p className="text-xs text-gray-700 line-clamp-1">
                        {assistant.description}
                      </p>
                      {integrationNames.length > 0 && (
                        <div className="mt-1">
                          <IntegrationIcons
                            integrations={integrationNames}
                            isActive={false}
                            className=""
                          />
                        </div>
                      )}
                    </div>
                    <CornerDownLeft className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Teams Group */}
        {groupedResults.teams.length > 0 && (
          <>
            <CommandGroup heading={t('CommandPalette.teams', 'Teams')}>
              {groupedResults.teams.map((result) => {
                const team = result.data as ITeam;
                return (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleSelectTeam(team)}
                    className="flex items-center gap-3 py-3"
                  >
                    <Layers className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-900 truncate">
                          {team.name}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 line-clamp-1">
                        {team.description}
                      </p>
                    </div>
                    <CornerDownLeft className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Workspace Items Group */}
        {isLoadingWorkspace && (
          <CommandGroup heading={t('CommandPalette.workspace', 'Workspace')}>
            <div className="flex items-center gap-2 px-2 py-3 text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              <span className="text-sm">Loading workspace files...</span>
            </div>
          </CommandGroup>
        )}
        {!isLoadingWorkspace && groupedResults.workspace.length > 0 && (
          <CommandGroup heading={t('CommandPalette.workspace', 'Workspace')}>
            {groupedResults.workspace.map((result) => {
              const item = result.data as WorkspaceSearchItem;
              return (
                <CommandItem
                  key={result.id}
                  onSelect={() => handleSelectWorkspace(item)}
                  className="flex items-center gap-3 py-3"
                >
                  <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-950 truncate">
                        {getWorkspaceItemTitle(item)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-800 line-clamp-1">
                      {getWorkspaceItemDescription(item)}
                    </p>
                  </div>
                  <CornerDownLeft className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>

      {/* Keyboard Shortcut Hint */}
      <div className="border-t px-3 py-2 text-xs text-gray-600 flex items-center justify-between">
        <span>
          {t('CommandPalette.hint', 'Press')}{' '}
          <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 border border-gray-300 rounded">
            {getKeyboardShortcut()}
          </kbd>{' '}
          {t('CommandPalette.hintToOpen', 'to open')}
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 border border-gray-300 rounded">
            ↑↓
          </kbd>
          {t('CommandPalette.navigate', 'to navigate')}
        </span>
      </div>

      {/* Loading Overlay */}
      {isChangingAssistant && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-sm font-medium text-gray-900">Switching assistant...</p>
            <p className="text-xs text-gray-500">This will only take a moment</p>
          </div>
        </div>
      )}
    </CommandDialog>
  );
};
