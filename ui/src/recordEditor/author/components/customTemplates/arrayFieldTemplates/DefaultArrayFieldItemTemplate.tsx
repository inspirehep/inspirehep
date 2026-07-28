import { ArrayFieldItemTemplateProps } from '@rjsf/utils';
import { Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

function DefaultArrayFieldItemTemplate({
  children,
  buttonsProps,
}: ArrayFieldItemTemplateProps) {
  return (
    <tr>
      {children}
      <td className="record-editor-array__actions-col">
        {buttonsProps.hasRemove && (
          <Button
            type="text"
            aria-label="Remove item"
            icon={<CloseOutlined />}
            onClick={buttonsProps.onRemoveItem}
          />
        )}
      </td>
    </tr>
  );
}

export default DefaultArrayFieldItemTemplate;
