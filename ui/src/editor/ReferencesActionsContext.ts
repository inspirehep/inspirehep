import { createContext, useContext } from 'react';

import { Reference } from './types';

export interface ReferencesActions {
  extractReferences: (source: string) => Promise<Reference[] | undefined>;
  linkReferences: (references: Reference[]) => Promise<Reference[] | undefined>;
}

export const ReferencesActionsContext = createContext<
  ReferencesActions | undefined
>(undefined);

export function useReferencesActions(): ReferencesActions {
  const actions = useContext(ReferencesActionsContext);
  if (!actions) {
    throw new Error(
      'useReferencesActions must be used within a ReferencesActionsContext provider'
    );
  }
  return actions;
}
