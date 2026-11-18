import { useCallback } from 'react';
import { FieldTemplateProps } from '@rjsf/utils';
import { FieldOnChangeContext } from '../../../FieldOnChangeContext';

function DefaultFieldTemplate({
  children,
  errors,
  onChange,
  fieldPathId,
  schema,
  hidden,
}: FieldTemplateProps) {
  const { path } = fieldPathId;
  const fieldOnChange = useCallback(
    (newValue: any) => onChange(newValue, path),
    [onChange, path]
  );
  if (hidden) {
    return null;
  }
  const isContainer = schema.type === 'object' || schema.type === 'array';
  return (
    <FieldOnChangeContext.Provider value={fieldOnChange}>
      {children}
      {!isContainer && <div className="field-errors">{errors}</div>}
    </FieldOnChangeContext.Provider>
  );
}

export default DefaultFieldTemplate;
