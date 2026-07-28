import { FieldTemplateProps } from '@rjsf/utils';
import { FieldOnChangeContext } from '../../../FieldOnChangeContext';

function DefaultFieldTemplate({
  children,
  errors,
  help,
  onChange,
  fieldPathId,
}: FieldTemplateProps) {
  return (
    <FieldOnChangeContext.Provider
      value={(newValue) => onChange(newValue, fieldPathId.path)}
    >
      {children}
      {errors}
      {help}
    </FieldOnChangeContext.Provider>
  );
}

export default DefaultFieldTemplate;
