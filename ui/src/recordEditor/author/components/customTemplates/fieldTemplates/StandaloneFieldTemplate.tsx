import { FieldTemplateProps } from '@rjsf/utils';
import { Button, Dropdown, Space } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';

function StandaloneFieldTemplate({
  label,
  children,
  errors,
  onChange,
  fieldPathId,
  readonly,
}: FieldTemplateProps) {
  const actions = [
    {
      key: 'delete',
      label: (
        <Button
          type="link"
          danger
          onClick={() => onChange(undefined, fieldPathId.path)}
          style={{ width: '100%' }}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="record-editor-field">
      <div className="record-editor-field__label">
        <Dropdown
          menu={{ items: actions }}
          trigger={['click']}
          disabled={readonly}
          styles={{
            root: { width: '100px', minWidth: '100px' },
            item: { padding: 0 },
          }}
        >
          <Space styles={{ root: { width: '100%' } }}>
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
