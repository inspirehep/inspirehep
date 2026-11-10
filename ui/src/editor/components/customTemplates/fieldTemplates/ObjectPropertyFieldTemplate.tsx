import { FieldTemplateProps } from '@rjsf/utils';
import LabelWithActions from '../LabelWithActions';

function ObjectPropertyFieldTemplate({
  label,
  children,
  errors,
  onChange,
  fieldPathId,
  readonly,
  uiSchema,
}: FieldTemplateProps) {
  const withLabel = uiSchema?.['ui:options']?.withLabel ?? true;

  return (
    <tr>
      {withLabel && (
        <td className="editor-array__row-label">
          <LabelWithActions
            canAdd={false}
            onRemoveClick={() => onChange(undefined, fieldPathId.path)}
            disabled={readonly ?? false}
            title={label}
          />
        </td>
      )}
      <td className="editor-array__cell">
        {children}
        <div className="field-errors">{errors}</div>
      </td>
      {withLabel && <td className="editor-array__actions-col" />}
    </tr>
  );
}

export default ObjectPropertyFieldTemplate;
