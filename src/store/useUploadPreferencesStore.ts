import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UploadPreferencesState {
  saveToCloud: boolean;
  setSaveToCloud: (value: boolean) => void;
}

export const useUploadPreferencesStore = create<UploadPreferencesState>()(
  persist(
    (set) => ({
      saveToCloud: false, // Default to false - direct base64 upload
      setSaveToCloud: (value) => set({ saveToCloud: value }),
    }),
    {
      name: 'upload-preferences', // Key in sessionStorage
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      },
    }
  )
);