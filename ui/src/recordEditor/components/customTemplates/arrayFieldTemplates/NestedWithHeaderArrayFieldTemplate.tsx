import { ArrayFieldTemplateProps, RJSFSchema, UiSchema } from '@rjsf/utils';

import { useFieldOnChange } from '../../../FieldOnChangeContext';
import ActionsDropdown from '../ActionsDropdown';

function NestedWithHeaderArrayFieldTemplate({
  title,
  items,
  onAddClick,
  schema,
  uiSchema,
  rawErrors,
  readonly,
}: ArrayFieldTemplateProps) {
  const onFieldChange = useFieldOnChange();
  const displayTitle = (uiSchema?.['ui:title'] as string | undefined) ?? title;

  const itemProperties =
    ((schema.items as RJSFSchema)?.properties as Record<string, unknown>) ?? {};
  const order = (uiSchema?.items as UiSchema)?.['ui:order'] as
    | string[]
    | undefined;
  const columns = order
    ? order.filter((key) => key in itemProperties)
    : Object.keys(itemProperties);

  return (
    <tr>
      <td className="record-editor-array__row-label">
        <ActionsDropdown
          onAddClick={onAddClick}
          onRemoveClick={() => onFieldChange(undefined)}
          disabled={readonly ?? false}
          title={displayTitle}
        />
      </td>
      <td className="record-editor-array__cell">
        <table className="record-editor-array__table">
          {items.length > 0 && (
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
          <tbody>
            {items.length === 0 ? (
              <tr>
                {columns.map((column) => (
                  <td key={column} className="record-editor-array__cell" />
                ))}
                <td className="record-editor-array__reorder-col" />
                <td className="record-editor-array__actions-col" />
              </tr>
            ) : (
              items
            )}
          </tbody>
        </table>
        <div className="field-errors">{rawErrors}</div>
      </td>
      <td className="record-editor-array__reorder-col" />
      <td className="record-editor-array__actions-col" />
    </tr>
  );
}

export default NestedWithHeaderArrayFieldTemplate;
