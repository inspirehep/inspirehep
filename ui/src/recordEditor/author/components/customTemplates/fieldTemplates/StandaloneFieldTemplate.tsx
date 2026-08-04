import { FieldTemplateProps } from '@rjsf/utils';
import { Button, Dropdown, Space } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';

function StandaloneFieldTemplate({
  label,
  children,
  errors,
  onChange,
  fieldPathId,
}: FieldTemplateProps) {
  const actions = [
    {
      key: 'delete',
      label: (
        <Button
          type="link"
          danger
          onClick={() => onChange(undefined, fieldPathId.path)}
        >
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
        <div className="field-errors">{errors}</div>
      </div>
    </div>
  );
}

export default StandaloneFieldTemplate;
