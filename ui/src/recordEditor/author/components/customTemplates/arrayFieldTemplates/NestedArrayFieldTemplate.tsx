import { ArrayFieldTemplateProps } from '@rjsf/utils';
import { Button, Dropdown, Space } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';

import { useFieldOnChange } from '../../../FieldOnChangeContext';
import NestedArrayRowLabelContext from './NestedArrayRowLabelContext';

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
    <NestedArrayRowLabelContext.Provider value={labelCell}>
      {items}
    </NestedArrayRowLabelContext.Provider>
  );
}

export default NestedArrayFieldTemplate;
