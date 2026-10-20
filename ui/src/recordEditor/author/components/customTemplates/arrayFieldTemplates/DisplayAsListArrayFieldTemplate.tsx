import { CaretDownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Space } from 'antd';
import { ArrayFieldTemplateProps } from '@rjsf/utils';
import { useFieldOnChange } from '../../../FieldOnChangeContext';
import { ArrayAddItemContext } from '../../../ArrayAddItemContext';

function DisplayAsListArrayFieldTemplate({
  title,
  items,
  onAddClick,
  uiSchema,
  rawErrors,
  readonly,
}: ArrayFieldTemplateProps) {
  const displayTitle = (uiSchema?.['ui:title'] as string | undefined) ?? title;
  const onFieldChange = useFieldOnChange();
  const addAt = (index: number) =>
    (onAddClick as (event: undefined, index: number) => void)(undefined, index);

  const actions = [
    {
      key: 'add',
      label: (
        <Button type="link" onClick={onAddClick} style={{ width: '100%' }}>
          Add new
        </Button>
      ),
    },
    {
      key: 'delete',
      label: (
        <Button
          type="link"
          danger
          onClick={() => onFieldChange(undefined)}
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
            {displayTitle}
            <CaretDownOutlined />
          </Space>
        </Dropdown>
      </div>
      <ArrayAddItemContext.Provider value={{ addAt }}>
        <div>{items}</div>
      </ArrayAddItemContext.Provider>
      <div className="field-errors">{rawErrors}</div>
    </div>
  );
}

export default DisplayAsListArrayFieldTemplate;
