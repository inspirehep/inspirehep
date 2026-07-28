import { Fragment } from 'react';
import { ObjectFieldTemplateProps } from '@rjsf/utils';
import { Button, Dropdown, Space } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
import { useFieldOnChange } from '../../../FieldOnChangeContext';
import {
  ArrayItemRemoveContext,
  useArrayItemRemove,
} from '../../../ArrayItemRemoveContext';

function TableObjectFieldTemplate({
  title,
  properties,
  uiSchema,
}: ObjectFieldTemplateProps) {
  const displayTitle = (uiSchema?.['ui:title'] as string | undefined) ?? title;
  const onFieldChange = useFieldOnChange();
  const arrayItemRemove = useArrayItemRemove();
  const showHeader = uiSchema?.['ui:options']?.showHeader ?? true;

  const handleDelete = arrayItemRemove
    ? arrayItemRemove.remove
    : () => onFieldChange(undefined);
  const actions = [
    {
      key: 'delete',
      label: (
        <Button type="link" danger onClick={handleDelete}>
          Delete
        </Button>
      ),
      disabled: arrayItemRemove ? !arrayItemRemove.canRemove : false,
    },
  ];
  return (
    <div className="record-editor-array">
      {showHeader && (
        <div className="record-editor-array__header">
          <Dropdown menu={{ items: actions }} trigger={['click']}>
            <Space>
              {displayTitle}
              <CaretDownOutlined />
            </Space>
          </Dropdown>
        </div>
      )}
      <table className="record-editor-array__table">
        <tbody>
          <ArrayItemRemoveContext.Provider value={undefined}>
            {properties.map((element) => (
              <Fragment key={element.name}>{element.content}</Fragment>
            ))}
          </ArrayItemRemoveContext.Provider>
        </tbody>
      </table>
    </div>
  );
}

export default TableObjectFieldTemplate;
