import { FieldTemplateProps } from '@rjsf/utils';
import { Button, Dropdown, Space } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';

function ObjectPropertyFieldTemplate({
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
    <tr>
      <td className="record-editor-array__row-label">
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
      </td>
      <td className="record-editor-array__cell">
        {children}
        <div className="field-errors">{errors}</div>
      </td>
      <td className="record-editor-array__actions-col" />
    </tr>
  );
}

export default ObjectPropertyFieldTemplate;
