import { ArrayFieldTemplateProps, RJSFSchema, UiSchema } from '@rjsf/utils';
import { Button, Dropdown, Space } from 'antd';
import { CaretDownOutlined, CloseOutlined } from '@ant-design/icons';

import { useFieldOnChange } from '../../../FieldOnChangeContext';

function NestedWithHeaderArrayFieldTemplate({
  title,
  items,
  canAdd,
  onAddClick,
  schema,
  uiSchema,
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

  const actions = [
    {
      key: 'add',
      label: (
        <Button type="link" onClick={onAddClick}>
          Add new
        </Button>
      ),
      disabled: !canAdd,
    },
    {
      key: 'delete',
      label: (
        <Button type="link" danger onClick={() => onFieldChange(undefined)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <tr>
      <td className="record-editor-array__row-label">
        <Dropdown menu={{ items: actions }} trigger={['click']}>
          <Space>
            {displayTitle}
            <CaretDownOutlined />
          </Space>
        </Dropdown>
      </td>
      <td className="record-editor-array__cell">
        <table className="record-editor-array__table">
          {items.length > 0 && (
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
            {items.length === 0 ? (
              <tr>
                {columns.map((column) => (
                  <td key={column} className="record-editor-array__cell" />
                ))}
                <td className="record-editor-array__actions-col" />
              </tr>
            ) : (
              items.map(
                ({ key, children, hasRemove, index, onDropIndexClick }) => (
                  <tr key={key}>
                    {children}
                    <td className="record-editor-array__actions-col">
                      {hasRemove && (
                        <Button
                          type="text"
                          aria-label="Remove item"
                          icon={<CloseOutlined />}
                          onClick={onDropIndexClick(index)}
                        />
                      )}
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </td>
      <td className="record-editor-array__actions-col" />
    </tr>
  );
}

export default NestedWithHeaderArrayFieldTemplate;
