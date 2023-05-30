import React, { useEffect, useRef } from "react";
import { Select, initTE } from "tw-elements";

interface ProcessorOption {
  value: string;
  text: string;
  secondaryText: string;
}

interface SelectInputProps {
  options: ProcessorOption[];
  value: string;
  onChange: (value: string) => void;
}

const SelectInput: React.FC<SelectInputProps> = ({
  options,
  value,
  onChange,
}) => {
  const selectRef = useRef<HTMLSelectElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  useEffect(() => {
    initTE({ Select });

    const selectInstance = Select.getInstance(selectRef.current);
    if (selectInstance) {
      selectInstance.setValue(value);
    }
  }, [value]);

  return (
    <div className="mb-4">
      <select
        data-te-select-init
        data-te-select-filter="true"
        data-te-select-size="lg"
        onChange={handleChange}
        ref={selectRef}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            data-te-select-secondary-text={option.secondaryText}
          >
            {option.text}
          </option>
        ))}
      </select>
    </div>
  );
};

export { SelectInput };
