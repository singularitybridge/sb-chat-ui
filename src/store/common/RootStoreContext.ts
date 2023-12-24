import { createContext, useContext } from 'react';
import { Instance } from 'mobx-state-tree';
import { RootStore } from '../models/RootStore';

const RootStoreContext = createContext<Instance<typeof RootStore> | null>(null);

export const RootStoreProvider = RootStoreContext.Provider;

export const useRootStore = () => {
  const store = useContext(RootStoreContext);
  if (store === null) {
    throw new Error('Store cannot be null, please add a context provider');
  }
  return store;
};

export default RootStoreContext;
