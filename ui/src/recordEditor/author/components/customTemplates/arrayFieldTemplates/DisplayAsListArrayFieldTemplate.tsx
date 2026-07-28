import { CaretDownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Space } from 'antd';
import { ArrayFieldTemplateProps } from '@rjsf/utils/lib/types';
import { useFieldOnChange } from '../../../FieldOnChangeContext';
import { ArrayItemRemoveContext } from '../../../ArrayItemRemoveContext';

function DisplayAsListArrayFieldTemplate({
  title,
  items,
  canAdd,
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
    <div className="record-editor-field">
      <div className="record-editor-field__label">
        <Dropdown menu={{ items: actions }} trigger={['click']}>
          <Space>
            {displayTitle}
            <CaretDownOutlined />
          </Space>
        </Dropdown>
      </div>
      <div>
        {items.map(({ key, children, hasRemove, index, onDropIndexClick }) => (
          <div key={key} className="record-editor-field__item">
            <ArrayItemRemoveContext.Provider
              value={{
                canRemove: hasRemove,
                remove: () => onDropIndexClick(index)(),
              }}
            >
              <div>{children}</div>
            </ArrayItemRemoveContext.Provider>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DisplayAsListArrayFieldTemplate;
