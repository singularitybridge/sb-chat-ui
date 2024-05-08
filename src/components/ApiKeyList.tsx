import React, { useState } from 'react';
import VerifiedInputWithLabel from './admin/VerifiedInputWithLabel';
import { verifyApiKey } from '../services/apiKeyVerificationService';

export interface ApiKey {
  key: string;
  label: string;
  value: string;
}

interface ApiKeyListProps {
  title: string;
  description: string;
  initialData: ApiKey[];
  onDataChange: (data: ApiKey[]) => void;
  onVerify: (value: string, key: string) => Promise<boolean>; 
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
    debugger;
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
      <h2 className="text-xl">{title}</h2>
      <p className="mb-2 text-sm">{description}</p>
      {initialData.map(({ key, label, value }, index) => (
        <VerifiedInputWithLabel
          apiKey={key}
          id={`api-key-${key}`}
          label={label}
          type="text"
          value={value}
          onChange={(newValue) => handleValueChange(newValue, index)}
          onVerify={handleVerify}
          autoFocus={index === 0}
        />
      ))}
    </div>
  );
};

export { ApiKeyList };
