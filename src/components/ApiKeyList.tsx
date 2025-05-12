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
  initialData: ApiKey[]; // Data from the backend
  allApiKeysConfig: ApiKey[]; // All possible API keys from companyFieldConfigs
  onDataChange: (data: ApiKey[]) => void;
  onVerify: (value: string, key: string) => Promise<boolean>;
}

const ApiKeyList: React.FC<ApiKeyListProps> = ({
  title,
  description,
  initialData,
  allApiKeysConfig,
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

  const handleValueChange = (newValue: string, configKey: string) => {
    // Find if the key already exists in initialData
    const existingKeyIndex = initialData.findIndex(item => item.key === configKey);
    let updatedData;

    if (existingKeyIndex !== -1) {
      // Update existing key
      updatedData = initialData.map((item, idx) =>
        idx === existingKeyIndex ? { ...item, value: newValue } : item
      );
    } else {
      // Add new key if it doesn't exist
      updatedData = [...initialData, { key: configKey, value: newValue }];
    }
    onDataChange(updatedData);
  };

  // Create a map of initialData for quick lookup
  const initialDataMap = new Map(initialData.map(item => [item.key, item.value]));

  return (
    <div>
      <div className="mb-4">
        <TextComponent size="subtitle" text={title} />
        <TextComponent size="small" text={description} />
      </div>

      <div className="flex flex-col space-y-3">
        {allApiKeysConfig.map(({ key: configKey, value: defaultValue }, index) => {
          const currentValue = initialDataMap.get(configKey) ?? defaultValue;
          return (
            <VerifiedInputWithLabel
              apiKey={configKey}
              id={`api-key-${configKey}`}
              key={configKey}
              label={configKey}
              type="text"
              value={currentValue}
              onChange={(newValue) => handleValueChange(newValue, configKey)}
              onVerify={handleVerify}
              autoFocus={index === 0}
            />
          );
        })}
      </div>
    </div>
  );
};

export { ApiKeyList };
