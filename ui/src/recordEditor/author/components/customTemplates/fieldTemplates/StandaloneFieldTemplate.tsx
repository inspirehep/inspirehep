import { FieldTemplateProps } from '@rjsf/utils/lib/types';
import { Button, Dropdown, Space } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';

function StandaloneFieldTemplate({
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
    <div className="record-editor-field">
      <div className="record-editor-field__label">
        <Dropdown menu={{ items: actions }} trigger={['click']}>
          <Space>
            {label}
            <CaretDownOutlined />
          </Space>
        </Dropdown>
      </div>
      <div className="record-editor-field__value">
        {children}
        {errors}
        {help}
      </div>
    </div>
  );
}

export default StandaloneFieldTemplate;
