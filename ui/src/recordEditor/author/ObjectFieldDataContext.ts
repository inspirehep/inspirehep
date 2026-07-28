import { FieldTemplateProps } from '@rjsf/utils/lib/types';
import { createContext, useContext } from 'react';

export interface ObjectFieldData {
  formData: Record<string, unknown>;
  onChange: FieldTemplateProps['onChange'];
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
