import React, { useState } from 'react';
import VerifiedInputWithLabel from './sb-core-ui-kit/VerifiedInputWithLabel';
import { verifyApiKey } from '../services/apiKeyVerificationService';
import { TextComponent } from './sb-core-ui-kit/TextComponent';

export interface ApiKey {
  key: string;
  value: string;
}

interface ApiKeyListProps {
  title: string;
  description: string;
  initialData: ApiKey[];
  onDataChange: (data: ApiKey[]) => void;
  onVerify: (value: string, key: string) => Promise<boolean>; // Add this line
}

const ApiKeyList: React.FC<ApiKeyListProps> = ({
  title,
  description,
  initialData,
  onDataChange,
}) => {
  const [verificationStatus, setVerificationStatus] = useState<
    Record<string, boolean>
  >({});

  const handleVerify = async (value: string, key: string) => {
    const isValid = await verifyApiKey(value, key);
    setVerificationStatus({ ...verificationStatus, [key]: isValid });
    return isValid;
  };

  const handleValueChange = (newValue: string, index: number) => {
    const updatedData = [...initialData];
    updatedData[index].value = newValue;
    onDataChange(updatedData);
  };

  return (
    <div>
      <div className="mb-4">
        <TextComponent size="subtitle" text={title} />
        <TextComponent size="small" text={description} />
      </div>

      <div className="flex flex-col space-y-3">
        {initialData.map(({ key, value }, index) => (
          <VerifiedInputWithLabel
            apiKey={key}
            id={`api-key-${key}`}
            key={key}
            label={key}
            type="text"
            value={value}
            onChange={(newValue) => handleValueChange(newValue, index)}
            onVerify={handleVerify}
            autoFocus={index === 0}
          />
        ))}
      </div>
    </div>
  );
};

export { ApiKeyList };
