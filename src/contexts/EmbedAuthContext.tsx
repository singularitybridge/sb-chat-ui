import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EmbedAuthContextType {
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
}

const EmbedAuthContext = createContext<EmbedAuthContextType | undefined>(undefined);

export const EmbedAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKey, setApiKey] = useState<string | null>(null);

  return (
    <EmbedAuthContext.Provider value={{ apiKey, setApiKey }}>
      {children}
    </EmbedAuthContext.Provider>
  );
};

export const useEmbedAuth = (): EmbedAuthContextType => {
  const context = useContext(EmbedAuthContext);
  if (context === undefined) {
    throw new Error('useEmbedAuth must be used within an EmbedAuthProvider');
  }
  return context;
};
