import { FieldTemplateProps } from '@rjsf/utils';
import { FieldOnChangeContext } from '../../../FieldOnChangeContext';

function DefaultFieldTemplate({
  children,
  errors,
  onChange,
  fieldPathId,
  schema,
}: FieldTemplateProps) {
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
