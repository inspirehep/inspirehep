import { Fragment } from 'react';
import { ObjectFieldTemplateProps } from '@rjsf/utils';

import { useFieldOnChange } from '../../../FieldOnChangeContext';
import {
  ArrayItemRemoveContext,
  useArrayItemRemove,
} from '../../../ArrayItemRemoveContext';
import ActionsDropdown from '../ActionsDropdown';

function TableObjectFieldTemplate({
  title,
  properties,
  uiSchema,
  readonly,
}: ObjectFieldTemplateProps) {
  const displayTitle = (uiSchema?.['ui:title'] as string | undefined) ?? title;
  const onFieldChange = useFieldOnChange();
  const arrayItemRemove = useArrayItemRemove();
  const showHeader = uiSchema?.['ui:options']?.showHeader ?? true;

  const handleDelete = arrayItemRemove
    ? arrayItemRemove.remove
    : () => onFieldChange(undefined);

  return (
    <div className="record-editor-array">
      {showHeader && (
        <div className="record-editor-array__header">
          <ActionsDropdown
            canAdd={false}
            onRemoveClick={handleDelete}
            disabled={readonly ?? false}
            title={displayTitle}
          />
        </div>
      )}
      <table className="record-editor-array__table">
        <tbody>
          <ArrayItemRemoveContext.Provider value={undefined}>
            {properties.map((element) => (
              <Fragment key={element.name}>{element.content}</Fragment>
            ))}
          </ArrayItemRemoveContext.Provider>
        </tbody>
      </table>
    </div>
  );
}

export default TableObjectFieldTemplate;
