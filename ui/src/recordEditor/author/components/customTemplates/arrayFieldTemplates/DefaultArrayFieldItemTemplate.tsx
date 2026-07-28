import { ArrayFieldTemplateItemType } from '@rjsf/utils';
import { Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

type DefaultArrayFieldItemTemplateProps = Omit<
  ArrayFieldTemplateItemType,
  'key'
>;

function DefaultArrayFieldItemTemplate({
  children,
  hasRemove,
  index,
  onDropIndexClick,
}: DefaultArrayFieldItemTemplateProps) {
  return (
    <tr>
      {children}
      <td className="record-editor-array__actions-col">
        {hasRemove && (
          <Button
            type="text"
            aria-label="Remove item"
            icon={<CloseOutlined />}
            onClick={onDropIndexClick(index)}
          />
        )}
      </td>
    </tr>
  );
}

export default DefaultArrayFieldItemTemplate;
