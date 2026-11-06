import { createContext, useContext } from 'react';

export interface ObjectFieldData {
  formData: Record<string, unknown>;
  onChange: (newValue: unknown) => void;
}

export const ObjectFieldDataContext = createContext<
  ObjectFieldData | undefined
>(undefined);

export function useObjectFieldData(): ObjectFieldData {
  const value = useContext(ObjectFieldDataContext);
  if (!value) {
    throw new Error(
      'useObjectFieldData must be used within a field rendered by ArrayItemObjectFieldTemplate'
    );
  }
  return value;
}
