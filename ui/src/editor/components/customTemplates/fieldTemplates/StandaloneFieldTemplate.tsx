import { FieldTemplateProps } from '@rjsf/utils';
import LabelWithActions from '../LabelWithActions';

function StandaloneFieldTemplate({
  label,
  children,
  errors,
  onChange,
  fieldPathId,
  readonly,
}: FieldTemplateProps) {
  return (
    <div className="editor-field">
      <div className="editor-field__label">
        <LabelWithActions
          canAdd={false}
          onRemoveClick={() => onChange(undefined, fieldPathId.path)}
          disabled={readonly ?? false}
          title={label}
        />
      </div>
      <div className="editor-field__value">
        {children}
        <div className="field-errors">{errors}</div>
      </div>
    </div>
  );
}

export default StandaloneFieldTemplate;
