import { Fragment } from 'react';
import { ObjectFieldTemplateProps } from '@rjsf/utils';

import { useFieldOnChange } from '../../../FieldOnChangeContext';
import {
  ArrayItemRemoveContext,
  useArrayItemRemove,
} from '../../../ArrayItemRemoveContext';
import LabelWithActions from '../LabelWithActions';

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
    <div className="editor-array">
      {showHeader && (
        <div className="editor-array__header">
          <LabelWithActions
            canAdd={false}
            onRemoveClick={handleDelete}
            disabled={readonly ?? false}
            title={displayTitle}
          />
        </div>
      )}
      <table className="editor-array__table">
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
