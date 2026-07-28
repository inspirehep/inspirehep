import { FieldTemplateProps } from '@rjsf/utils';
import { FieldOnChangeContext } from '../../../FieldOnChangeContext';

function DefaultFieldTemplate({
  children,
  errors,
  onChange,
  fieldPathId,
}: FieldTemplateProps) {
  return (
    <FieldOnChangeContext.Provider
      value={(newValue) => onChange(newValue, fieldPathId.path)}
    >
      {children}
      {errors}
    </FieldOnChangeContext.Provider>
  );
}

export default DefaultFieldTemplate;
