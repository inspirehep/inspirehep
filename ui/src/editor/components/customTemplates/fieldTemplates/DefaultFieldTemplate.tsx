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
  if (hidden) {
    return null;
  }
  const isContainer = schema.type === 'object' || schema.type === 'array';
  return (
    <FieldOnChangeContext.Provider
      value={(newValue) => onChange(newValue, fieldPathId.path)}
    >
      {children}
      {!isContainer && <div className="field-errors">{errors}</div>}
    </FieldOnChangeContext.Provider>
  );
}

export default DefaultFieldTemplate;
