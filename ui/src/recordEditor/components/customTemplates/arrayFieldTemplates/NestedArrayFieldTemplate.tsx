import { ArrayFieldTemplateProps } from '@rjsf/utils';

import { useFieldOnChange } from '../../../FieldOnChangeContext';
import NestedArrayRowLabelContext from './NestedArrayRowLabelContext';
import ActionsDropdown from '../ActionsDropdown';

function NestedArrayFieldTemplate({
  title,
  items,
  onAddClick,
  uiSchema,
  rawErrors,
  readonly,
}: ArrayFieldTemplateProps) {
  const onFieldChange = useFieldOnChange();
  const displayTitle = (uiSchema?.['ui:title'] as string | undefined) ?? title;

  const labelCell = (
    <td
      className="record-editor-array__row-label"
      rowSpan={items.length > 0 ? items.length : 1}
    >
      <ActionsDropdown
        onAddClick={onAddClick}
        onRemoveClick={() => onFieldChange(undefined)}
        disabled={readonly ?? false}
        title={displayTitle}
      />
    </td>
  );

  if (items.length === 0) {
    return (
      <tr>
        {labelCell}
        <td className="record-editor-array__cell" />
        <td className="record-editor-array__reorder-col" />
        <td className="record-editor-array__actions-col" />
      </tr>
    );
  }

  return (
    <NestedArrayRowLabelContext.Provider value={labelCell}>
      {items}
      <tr>
        <td>
          <div className="field-errors">{rawErrors}</div>
        </td>
      </tr>
    </NestedArrayRowLabelContext.Provider>
  );
}

export default NestedArrayFieldTemplate;
