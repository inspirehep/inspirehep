import { createContext, useContext } from 'react';

import { Author, Reference } from './types';

export interface ToolbarActions {
  extractReferences: (source: string) => Promise<Reference[] | undefined>;
  linkReferences: (references: Reference[]) => Promise<Reference[] | undefined>;
  extractAuthors: (source: string) => Promise<Author[] | undefined>;
}

export const ToolbarActionsContext = createContext<ToolbarActions | undefined>(
  undefined
);

export function useToolbarActions(): ToolbarActions {
  const actions = useContext(ToolbarActionsContext);
  if (!actions) {
    throw new Error(
      'useToolbarActions must be used within a ToolbarActionsContext provider'
    );
  }
  return actions;
}
