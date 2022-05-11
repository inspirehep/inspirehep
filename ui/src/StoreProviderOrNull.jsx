import { Provider } from 'react-redux';
import React, { useState, useEffect } from 'react';
import createStore, { REDUCERS_TO_PERSIST } from './store';

import { reHydrateRootStateFromStorage } from './middlewares/statePersister';

export const StoreProviderOrNull = ({ children }) => {
  const [isBootstrapped, setBootstrapped] = useState(false);
  const [data, setData] = useState(false);

  const resolveStorage = async () => {
    setData(await reHydrateRootStateFromStorage(REDUCERS_TO_PERSIST));
    setBootstrapped(true);
  };

  useEffect(() => {
    resolveStorage();
  }, []);

  if (!isBootstrapped) return null;

  const store = createStore(data);

  return <Provider store={store}>{children}</Provider>;
};
