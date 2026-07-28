import { createContext, useContext } from 'react';

export interface ArrayItemRemove {
  canRemove: boolean;
  remove: () => void;
}

export const ArrayItemRemoveContext = createContext<
  ArrayItemRemove | undefined
>(undefined);

export function useArrayItemRemove(): ArrayItemRemove | undefined {
  return useContext(ArrayItemRemoveContext);
}
