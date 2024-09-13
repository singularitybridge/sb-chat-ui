import React from 'react';
import { TagInput } from './TagInput';
import { useTranslation } from 'react-i18next';
import { SelectList } from './sb-core-ui-kit/SelectList';

export interface TagType {
  id: string;
  name: string;
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

  const noTagsText = selectedTags.length === 0 ? t('CompaniesPage.noActionSelected') : null;

  const removeTag = (tagToRemove: string) => {
    onChange(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  const addTag = (tagToAdd: string) => {
    if (!selectedTags.includes(tagToAdd)) {
      onChange([...selectedTags, tagToAdd]);
    }
  };

  const handleSelectTag = (tagId: string | number) => {
    addTag(String(tagId));
  }

  // Filter out tags that are already selected
  const filteredAvailableTags = availableTags.filter(
    (availableTag) => !selectedTags.includes(availableTag.id)
  );

  return (
    <>
      <div className="mb-2">
        <h2 className="text-xl">{title}</h2>
        <p className="mb-2 text-sm">{description}</p>
      </div>
      <div className="rounded border border-solid border-neutral-300 bg-transparent bg-clip-padding px-3 py-3 text-base font-normal leading-tight text-neutral-700 transition duration-200 ease-linear placeholder:text-transparent focus:border-primary focus:pb-[0.625rem] focus:pt-[1.625rem] focus:text-neutral-700 focus:outline-none peer-focus:text-primary dark:border-neutral-600 dark:text-neutral-200 dark:focus:border-primary dark:peer-focus:text-primary flex-col space-y-2 ">
        <div>
          {noTagsText ||
            selectedTags.map((tagId) => {
              const tag = availableTags.find((t) => t.id === tagId);
              return tag ? (
                <TagInput key={tagId} title={tag.name} onRemove={() => removeTag(tagId)} />
              ) : null;
            })}
        </div>

        <div>
          <SelectList
            label={t('CompaniesPage.addTag')}
            options={filteredAvailableTags.map((tag) => ({
              value: tag.id,
              label: tag.name,
            }))}
            onSelect={handleSelectTag}
          />
        </div>
      </div>
    </>
  );
};

export { TagsInput };
