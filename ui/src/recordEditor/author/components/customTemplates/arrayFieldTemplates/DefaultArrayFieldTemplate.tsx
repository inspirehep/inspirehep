import { ArrayFieldTemplateProps, RJSFSchema, UiSchema } from '@rjsf/utils';
import { Button, Dropdown, Space } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';

import { useFieldOnChange } from '../../../FieldOnChangeContext';
import DefaultArrayFieldItemTemplate from './DefaultArrayFieldItemTemplate';

function DefaultArrayFieldTemplate({
  title,
  items,
  canAdd,
  onAddClick,
  schema,
  uiSchema,
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
  const removable =
    (uiSchema as UiSchema)?.['ui:options']?.['removable'] ?? true;
  const clearable =
    (uiSchema as UiSchema)?.['ui:options']?.['clearable'] ?? true;
  const canRemove = removable && clearable;
  const showHeader =
    (uiSchema as UiSchema)?.['ui:options']?.['showHeader'] ?? true;

  const onFieldChange = useFieldOnChange();

  const actions = [
    canAdd
      ? {
          key: 'add',
          label: (
            <Button type="link" onClick={onAddClick}>
              Add new
            </Button>
          ),
        }
      : undefined,
    canRemove
      ? {
          key: 'delete',
          label: (
            <Button type="link" danger onClick={() => onFieldChange(undefined)}>
              Delete
            </Button>
          ),
        }
      : undefined,
  ];

  return (
    <div className="record-editor-array">
      <div className="record-editor-array__header">
        <Dropdown
          menu={{ items: actions.filter((action) => action !== undefined) }}
          trigger={['click']}
        >
          <Space>
            {displayTitle}
            <CaretDownOutlined />
          </Space>
        </Dropdown>
      </div>
      <table className="record-editor-array__table">
        {showHeader && (
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
              <th className="record-editor-array__actions-col" />
            </tr>
          </thead>
        )}
        <tbody>
          {items.map(({ key, ...itemProps }) => (
            <DefaultArrayFieldItemTemplate key={key} {...itemProps} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DefaultArrayFieldTemplate;
