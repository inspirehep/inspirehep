import { FieldTemplateProps } from '@rjsf/utils';
import ActionsDropdown from '../ActionsDropdown';

function StandaloneFieldTemplate({
  label,
  children,
  errors,
  onChange,
  fieldPathId,
  readonly,
}: FieldTemplateProps) {
  return (
    <div className="record-editor-field">
      <div className="record-editor-field__label">
        <ActionsDropdown
          canAdd={false}
          onRemoveClick={() => onChange(undefined, fieldPathId.path)}
          disabled={readonly ?? false}
          title={label}
        />
      </div>
      <div className="record-editor-field__value">
        {children}
        <div className="field-errors">{errors}</div>
      </div>
    </div>
  );
}

export default StandaloneFieldTemplate;
