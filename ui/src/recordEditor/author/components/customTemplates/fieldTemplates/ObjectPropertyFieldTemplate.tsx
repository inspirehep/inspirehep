import { FieldTemplateProps } from '@rjsf/utils/lib/types';
import { Button, Dropdown, Space } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';

function ObjectPropertyFieldTemplate({
  label,
  children,
  errors,
  help,
  onChange,
}: FieldTemplateProps) {
  const actions = [
    {
      key: 'delete',
      label: (
        <Button type="link" danger onClick={() => onChange(undefined)}>
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
            {label}
            <CaretDownOutlined />
          </Space>
        </Dropdown>
      </td>
      <td className="record-editor-array__cell">
        {children}
        {errors}
        {help}
      </td>
      <td className="record-editor-array__actions-col" />
    </tr>
  );
}

export default ObjectPropertyFieldTemplate;
