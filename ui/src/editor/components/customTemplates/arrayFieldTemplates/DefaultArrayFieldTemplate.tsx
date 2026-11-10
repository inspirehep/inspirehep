import { ArrayFieldTemplateProps, RJSFSchema, UiSchema } from '@rjsf/utils';

import { useFieldOnChange } from '../../../FieldOnChangeContext';
import { useDocumentUpload } from '../../../DocumentUploadContext';
import LabelWithActions from '../LabelWithActions';

function DefaultArrayFieldTemplate({
  title,
  items,
  canAdd,
  onAddClick,
  schema,
  uiSchema,
  rawErrors,
  readonly,
  formData,
}: ArrayFieldTemplateProps) {
  const displayTitle = uiSchema?.['ui:title'] ?? title;
  const itemProperties =
    ((schema.items as RJSFSchema)?.properties as Record<string, unknown>) ?? {};
  const order = (uiSchema?.items as UiSchema)?.['ui:order'] as
    | string[]
    | undefined;
  const itemsSchema = schema.items as RJSFSchema | undefined;
  const isPrimitiveItems =
    itemsSchema?.type !== undefined && itemsSchema.type !== 'object';
  const columns = order
    ? order.filter((key) => key in itemProperties)
    : Object.keys(itemProperties);
  const removable = (uiSchema as UiSchema)?.['ui:options']?.removable ?? true;
  const clearable = (uiSchema as UiSchema)?.['ui:options']?.clearable ?? true;
  const canRemove = removable && clearable;
  const scrollable =
    (uiSchema as UiSchema)?.['ui:options']?.scrollable ?? false;
  const showHeader = (uiSchema as UiSchema)?.['ui:options']?.showHeader ?? true;

  const uploadable =
    (uiSchema as UiSchema)?.['ui:options']?.uploadable ?? false;

  const onFieldChange = useFieldOnChange();
  const uploadDocument = useDocumentUpload();

  const onUpload = async (file: File) => {
    const path = await uploadDocument?.(file);
    if (path) {
      onFieldChange([...(formData ?? []), { url: path, key: file.name }]);
    }
  };

  return (
    <div className="editor-array">
      <div className="editor-array__header">
        <LabelWithActions
          canAdd={canAdd ?? false}
          canRemove={canRemove}
          onAddClick={onAddClick}
          onRemoveClick={() => onFieldChange(undefined)}
          canUpload={uploadable && !!uploadDocument}
          onUpload={onUpload}
          disabled={readonly ?? false}
          title={displayTitle}
        />
      </div>
      <div className={scrollable ? 'editor-array__scroll' : undefined}>
        <table
          className={`editor-array__table${
            scrollable ? ' editor-array__table--scrollable' : ''
          }`}
        >
          {showHeader && (
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
                {isPrimitiveItems && <th />}
                <th className="editor-array__reorder-col" />
                <th className="editor-array__actions-col" />
              </tr>
            </thead>
          )}
          <tbody>{items}</tbody>
        </table>
      </div>
      <div className="field-errors">{rawErrors}</div>
    </div>
  );
}

export default DefaultArrayFieldTemplate;
