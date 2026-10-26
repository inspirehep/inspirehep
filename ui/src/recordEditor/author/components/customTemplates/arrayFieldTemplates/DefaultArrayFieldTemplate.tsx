import { ArrayFieldTemplateProps, RJSFSchema, UiSchema } from '@rjsf/utils';

import { useFieldOnChange } from '../../../FieldOnChangeContext';
import ActionsDropdown from '../ActionsDropdown';

function DefaultArrayFieldTemplate({
  title,
  items,
  canAdd,
  onAddClick,
  schema,
  uiSchema,
  rawErrors,
  readonly,
}: ArrayFieldTemplateProps) {
  const displayTitle = uiSchema?.['ui:title'] ?? title;
  const itemProperties =
    ((schema.items as RJSFSchema)?.properties as Record<string, unknown>) ?? {};
  const order = (uiSchema?.items as UiSchema)?.['ui:order'] as
    | string[]
    | undefined;
  const columns = order
    ? order.filter((key) => key in itemProperties)
    : Object.keys(itemProperties);
  const removable = (uiSchema as UiSchema)?.['ui:options']?.removable ?? true;
  const clearable = (uiSchema as UiSchema)?.['ui:options']?.clearable ?? true;
  const canRemove = removable && clearable;
  const showHeader = (uiSchema as UiSchema)?.['ui:options']?.showHeader ?? true;

  const onFieldChange = useFieldOnChange();

  return (
    <div className="record-editor-array">
      <div className="record-editor-array__header">
        <ActionsDropdown
          canAdd={canAdd ?? false}
          canRemove={canRemove}
          onAddClick={onAddClick}
          onRemoveClick={() => onFieldChange(undefined)}
          disabled={readonly ?? false}
          title={displayTitle}
        />
      </div>
      <table className="record-editor-array__table">
        {showHeader && (
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
              <th className="record-editor-array__reorder-col" />
              <th className="record-editor-array__actions-col" />
            </tr>
          </thead>
        )}
        <tbody>{items}</tbody>
      </table>
      <div className="field-errors">{rawErrors}</div>
    </div>
  );
}

export default DefaultArrayFieldTemplate;
