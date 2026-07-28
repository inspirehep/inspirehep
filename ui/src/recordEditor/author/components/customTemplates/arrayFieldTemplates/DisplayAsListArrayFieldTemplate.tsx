import { CaretDownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Space } from 'antd';
import { ArrayFieldTemplateProps } from '@rjsf/utils';
import { useFieldOnChange } from '../../../FieldOnChangeContext';

function DisplayAsListArrayFieldTemplate({
  title,
  items,
  onAddClick,
  uiSchema,
}: ArrayFieldTemplateProps) {
  const displayTitle = (uiSchema?.['ui:title'] as string | undefined) ?? title;
  const onFieldChange = useFieldOnChange();
  const actions = [
    {
      key: 'add',
      label: (
        <Button type="link" onClick={onAddClick}>
          Add new
        </Button>
      ),
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
    <div className="record-editor-field">
      <div className="record-editor-field__label">
        <Dropdown menu={{ items: actions }} trigger={['click']}>
          <Space>
            {displayTitle}
            <CaretDownOutlined />
          </Space>
        </Dropdown>
      </div>
      <div>{items}</div>
    </div>
  );
}

export default DisplayAsListArrayFieldTemplate;
