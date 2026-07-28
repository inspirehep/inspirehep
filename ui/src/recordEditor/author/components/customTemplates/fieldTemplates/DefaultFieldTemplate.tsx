import { FieldTemplateProps } from '@rjsf/utils/lib/types';
import { FieldOnChangeContext } from '../../../FieldOnChangeContext';

function DefaultFieldTemplate({
  children,
  errors,
  help,
  onChange,
}: FieldTemplateProps) {
  return (
    <FieldOnChangeContext.Provider value={onChange}>
      {children}
      {errors}
      {help}
    </FieldOnChangeContext.Provider>
  );
}

export default DefaultFieldTemplate;
