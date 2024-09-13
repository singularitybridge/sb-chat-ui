import React from 'react';
import { TagInput } from './TagInput';
import { useTranslation } from 'react-i18next';
import { SelectList, SelectListOption } from './sb-core-ui-kit/SelectList';

export interface TagType {
  id: string;
  name: string;
  icon: string;
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

  const selectOptions: SelectListOption[] = filteredAvailableTags.map((tag) => ({
    value: tag.id,
    label: `${tag.icon} ${tag.name}`
  }));

  return (
    <>
      <div className="mb-2">
        <h2 className="text-xl">{title}</h2>
        <p className="text-sm">{description}</p>
      </div>
      <div className="rounded border border-solid border-neutral-300 bg-transparent bg-clip-padding px-3 py-3 text-base font-normal leading-tight text-neutral-700 transition duration-200 ease-linear placeholder:text-transparent focus:border-primary focus:pb-[0.625rem] focus:pt-[1.625rem] focus:text-neutral-700 focus:outline-none peer-focus:text-primary dark:border-neutral-600 dark:text-neutral-200 dark:focus:border-primary dark:peer-focus:text-primary flex-col space-y-2 ">
        <div>
          {noTagsText ||
            selectedTags.map((tagId) => {
              const tag = availableTags.find((t) => t.id === tagId);
              return tag ? (
                <div key={tagId} className="mb-2 p-2 bg-gray-100 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="mr-2">{tag.icon}</span>
                      <span className="font-bold">{tag.title}</span>
                    </div>
                    <button
                      onClick={() => removeTag(tagId)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-sm mt-1">{tag.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{tag.serviceName}</p>
                </div>
              ) : null;
            })}
        </div>

        <div>
          <SelectList
            label={t('CompaniesPage.addTag')}
            options={selectOptions}
            onSelect={handleSelectTag}
          />
        </div>
      </div>
    </>
  );
};

export { TagsInput };
