import { createContext, useContext } from 'react';

export interface ArrayAddItem {
  addAt: (index: number) => void;
}

export const ArrayAddItemContext = createContext<ArrayAddItem | undefined>(
  undefined
);

export function useArrayAddItem(): ArrayAddItem | undefined {
  return useContext(ArrayAddItemContext);
}
