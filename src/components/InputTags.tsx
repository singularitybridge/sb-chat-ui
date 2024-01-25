import React, { useState } from 'react';
import { TagInput } from './TagInput';

export interface TagType {
  // Renamed interface
  id: string | number;
  name: string;
}

export interface TagsInputProps {
  selectedTags?: TagType[];
}

const TagsInput: React.FC<TagsInputProps> = ({ selectedTags = [] }) => {
  const [tags, setTags] = useState<TagType[]>(selectedTags); // Use TagType here

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag.name !== tagToRemove));
  };

  return (
    <>
      <div className=" bg-sky-50 p-2">
        {tags.map((tag) => (
          <TagInput key={tag.id} title={tag.name} onRemove={removeTag} /> // Use TagComponent here
        ))}
      </div>
    </>
  );
};

export { TagsInput };
