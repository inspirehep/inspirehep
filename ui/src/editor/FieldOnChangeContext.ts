import { createContext, useContext } from 'react';

type FieldOnChange = (newValue: unknown) => void;

export const FieldOnChangeContext = createContext<FieldOnChange | undefined>(
  undefined
);

export function useFieldOnChange(): FieldOnChange {
  const onChange = useContext(FieldOnChangeContext);
  if (!onChange) {
    throw new Error(
      'useFieldOnChange must be used within a field rendered by DefaultFieldTemplate'
    );
  }
  return onChange;
}
