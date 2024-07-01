import React, { useState } from 'react';
import VerifiedInputWithLabel from './admin/VerifiedInputWithLabel';
import { verifyApiKey } from '../services/apiKeyVerificationService';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="text-xl">{t(title)}</h2>
      <p className="mb-4 text-sm">{t(description)}</p>
      <div className="flex flex-col space-y-3">
        {initialData.map(({ key, label, value }, index) => (
          <VerifiedInputWithLabel
            apiKey={key}
            id={`api-key-${key}`}
            key={key}
            label={label}
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
