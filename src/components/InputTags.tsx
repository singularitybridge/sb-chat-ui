import React, { useEffect, useState } from 'react';
import { TagInput } from './TagInput';
import { CustomDropdown } from './CustomDropdown';

export interface TagType {
  id: string | number;
  name: string;
}

export interface TagsInputProps {
  selectedTags?: TagType[];
  availableTags: TagType[];
  title: string;
  description: string;
  onTagsChange?: (tags: TagType[]) => void;
}

const TagsInput: React.FC<TagsInputProps> = ({
  selectedTags = [],
  availableTags,
  title,
  description,
  onTagsChange,
}) => {
  const [tags, setTags] = useState<TagType[]>(selectedTags);

  useEffect(() => {
    if (onTagsChange) {
      onTagsChange(tags);
    }
  }, [tags, onTagsChange]);

  const noTagsText = tags.length === 0 ? 'no action selected' : null;

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag.name !== tagToRemove));
  };

  const addTag = (tagToAdd: TagType) => {
    if (!tags.find((tag) => tag.id === tagToAdd.id)) {
      setTags([...tags, tagToAdd]);
    }
  };

  const handleSelectTag = (option: {
    value: string | number;
    label: string;
  }) => {
    // Create a TagType object from the selected DropdownOption
    const tagToAdd: TagType = { id: option.value, name: option.label };
    addTag(tagToAdd);
  };

  // Filter out tags that are already selected
  const filteredAvailableTags = availableTags.filter(
    (availableTag) =>
      !tags.find((selectedTag) => selectedTag.id === availableTag.id)
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
            tags.map((tag) => (
              <TagInput key={tag.id} title={tag.name} onRemove={removeTag} />
            ))}
        </div>

        <div>
          <CustomDropdown
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
