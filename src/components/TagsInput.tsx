import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActionSelect, ActionOption } from './ActionSelect';
import ActionTag from './ActionTag';

export interface TagType {
  id: string;
  name: string;
  iconName: string;
  title: string;
  description: string;
  serviceName: string;
}

export interface TagsInputProps {
  selectedTags: string[];
  availableTags: TagType[];
  title: string;
  description: string;
  onChange: (tags: string[]) => void;
}

const TagsInput: React.FC<TagsInputProps> = ({
  selectedTags,
  availableTags,
  title,
  description,
  onChange,
}) => {
  const { t } = useTranslation();

  const removeTag = (tagToRemove: string) => {
    onChange(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  const addTag = (tagToAdd: string) => {
    if (!selectedTags.includes(tagToAdd)) {
      onChange([...selectedTags, tagToAdd]);
    }
  };

  // Filter out tags that are already selected
  const filteredAvailableTags = availableTags.filter(
    (availableTag) => !selectedTags.includes(availableTag.id)
  );

  const actionOptions: ActionOption[] = filteredAvailableTags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    iconName: tag.iconName,
    title: tag.title,
    description: tag.description,
    serviceName: tag.serviceName,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="border border-gray-300 rounded-lg p-4 space-y-4">
        {selectedTags.length === 0 ? (
          <p className="text-gray-500">{t('CompaniesPage.noActionSelected')}</p>
        ) : (
          <div className="space-y-2">
            {selectedTags.map((tagId) => {
              const tag = availableTags.find((t) => t.id === tagId);
              return tag ? (
                <ActionTag
                  key={tagId}
                  iconName={tag.iconName}
                  title={tag.title}
                  description={tag.description}
                  serviceName={tag.serviceName}
                  onRemove={() => removeTag(tagId)}
                />
              ) : null;
            })}
          </div>
        )}
        <div className="pt-4 border-t border-gray-200">
          <ActionSelect
            label={t('CompaniesPage.addTag')}
            options={actionOptions}
            onSelect={addTag}
            placeholder={t('CompaniesPage.selectAction')}
          />
        </div>
      </div>
    </div>
  );
};

export { TagsInput };
