import { FieldTemplateProps } from '@rjsf/utils';
import ActionsDropdown from '../ActionsDropdown';

function ObjectPropertyFieldTemplate({
  label,
  children,
  errors,
  onChange,
  fieldPathId,
  readonly,
}: FieldTemplateProps) {
  return (
    <tr>
      <td className="editor-array__row-label">
        <ActionsDropdown
          canAdd={false}
          onRemoveClick={() => onChange(undefined, fieldPathId.path)}
          disabled={readonly ?? false}
          title={label}
        />
      </td>
      <td className="editor-array__cell">
        {children}
        <div className="field-errors">{errors}</div>
      </td>
      <td className="editor-array__actions-col" />
    </tr>
  );
}

export default ObjectPropertyFieldTemplate;
