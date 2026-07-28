import { ArrayFieldTemplateProps } from '@rjsf/utils';
import { Button, Dropdown, Space } from 'antd';
import { CaretDownOutlined, CloseOutlined } from '@ant-design/icons';

import { useFieldOnChange } from '../../../FieldOnChangeContext';

function NestedArrayFieldTemplate({
  title,
  items,
  canAdd,
  onAddClick,
  uiSchema,
}: ArrayFieldTemplateProps) {
  const onFieldChange = useFieldOnChange();
  const displayTitle = (uiSchema?.['ui:title'] as string | undefined) ?? title;

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

  const labelCell = (
    <td
      className="record-editor-array__row-label"
      rowSpan={items.length > 0 ? items.length : 1}
    >
      <Dropdown menu={{ items: actions }} trigger={['click']}>
        <Space>
          {displayTitle}
          <CaretDownOutlined />
        </Space>
      </Dropdown>
    </td>
  );

  if (items.length === 0) {
    return (
      <tr>
        {labelCell}
        <td className="record-editor-array__cell" />
        <td className="record-editor-array__actions-col" />
      </tr>
    );
  }

  return (
    <>
      {items.map(({ key, children, hasRemove, index, onDropIndexClick }) => (
        <tr key={key}>
          {index === 0 && labelCell}
          <td className="record-editor-array__cell">{children}</td>
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
      ))}
    </>
  );
}

export default NestedArrayFieldTemplate;
