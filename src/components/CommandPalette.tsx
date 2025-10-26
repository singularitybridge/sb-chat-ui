import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { IAssistant } from '../store/models/Assistant';
import { useFuzzySearch } from '../hooks/useFuzzySearch';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './ui/command';
import { commandGroups, getKeyboardShortcut } from '../config/commandPalette';
import { Avatar, AvatarStyles } from './Avatar';
import { ModelIndicator } from './ModelIndicator';
import IntegrationIcons from './IntegrationIcons';
import { CornerDownLeft } from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assistants: IAssistant[];
  onSelectAssistant: (assistant: IAssistant) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onOpenChange,
  assistants,
  onSelectAssistant,
}) => {
  const { t } = useTranslation();
  const { results, searchQuery, setSearchQuery } = useFuzzySearch(assistants);

  // Reset search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
    }
  }, [open, setSearchQuery]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const handleSelect = useCallback(
    (assistant: IAssistant) => {
      onSelectAssistant(assistant);
      onOpenChange(false);
    },
    [onSelectAssistant, onOpenChange]
  );

  const extractIntegrationNames = (allowedActions: string[]): string[] => {
    return [...new Set(allowedActions.map((action) => action.split('.')[0]))];
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder={t('CommandPalette.searchPlaceholder', 'Search assistants...')}
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>
          {t('CommandPalette.noResults', 'No results found.')}
        </CommandEmpty>

        {/* Active Assistants Group */}
        <CommandGroup heading={commandGroups[0].label}>
          {results.map((assistant) => {
            const integrationNames = extractIntegrationNames(assistant.allowedActions);
            return (
              <CommandItem
                key={assistant._id}
                onSelect={() => handleSelect(assistant)}
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
                    <span className="font-medium text-sm truncate">
                      {assistant.name}
                    </span>
                    <ModelIndicator modelName={assistant.llmModel} size="small" />
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {assistant.description}
                  </p>
                  {integrationNames.length > 0 && (
                    <div className="mt-1">
                      <IntegrationIcons
                        integrations={integrationNames}
                        isActive={false}
                        className="opacity-70"
                      />
                    </div>
                  )}
                </div>
                <CornerDownLeft className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </CommandItem>
            );
          })}
        </CommandGroup>

        {/* Disabled Groups */}
        {commandGroups.slice(1).map((group, index) => (
          <React.Fragment key={group.id}>
            <CommandSeparator />
            <CommandGroup heading={group.label}>
              <CommandItem disabled className="flex items-center gap-2 opacity-50">
                <group.icon className="w-4 h-4" />
                <span className="text-sm">{group.description}</span>
              </CommandItem>
            </CommandGroup>
          </React.Fragment>
        ))}
      </CommandList>

      {/* Keyboard Shortcut Hint */}
      <div className="border-t px-3 py-2 text-xs text-gray-500 flex items-center justify-between">
        <span>
          {t('CommandPalette.hint', 'Press')} <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 border border-gray-300 rounded">{getKeyboardShortcut()}</kbd> {t('CommandPalette.hintToOpen', 'to open')}
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 border border-gray-300 rounded">↑↓</kbd>
          {t('CommandPalette.navigate', 'to navigate')}
        </span>
      </div>
    </CommandDialog>
  );
};
