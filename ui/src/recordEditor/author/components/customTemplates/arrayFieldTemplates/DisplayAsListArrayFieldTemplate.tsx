import { ArrayFieldTemplateProps } from '@rjsf/utils';
import { useFieldOnChange } from '../../../FieldOnChangeContext';
import { ArrayAddItemContext } from '../../../ArrayAddItemContext';
import ActionsDropdown from '../ActionsDropdown';

function DisplayAsListArrayFieldTemplate({
  title,
  items,
  onAddClick,
  uiSchema,
  rawErrors,
  readonly,
}: ArrayFieldTemplateProps) {
  const displayTitle = (uiSchema?.['ui:title'] as string | undefined) ?? title;
  const onFieldChange = useFieldOnChange();
  const addAt = (index: number) =>
    (onAddClick as (event: undefined, index: number) => void)(undefined, index);

  return (
    <div className="record-editor-field">
      <div className="record-editor-field__label">
        <ActionsDropdown
          onAddClick={onAddClick}
          onRemoveClick={() => onFieldChange(undefined)}
          disabled={readonly ?? false}
          title={displayTitle}
        />
      </div>
      <ArrayAddItemContext.Provider value={{ addAt }}>
        <div>{items}</div>
      </ArrayAddItemContext.Provider>
      <div className="field-errors">{rawErrors}</div>
    </div>
  );
}

export default DisplayAsListArrayFieldTemplate;
