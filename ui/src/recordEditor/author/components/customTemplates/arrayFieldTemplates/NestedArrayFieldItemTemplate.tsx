import { useContext } from 'react';
import { ArrayFieldItemTemplateProps } from '@rjsf/utils';
import { Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

import NestedArrayRowLabelContext from './NestedArrayRowLabelContext';

function NestedArrayFieldItemTemplate({
  children,
  buttonsProps,
  index,
}: ArrayFieldItemTemplateProps) {
  const rowLabelCell = useContext(NestedArrayRowLabelContext);

  return (
    <tr>
      {index === 0 && rowLabelCell}
      <td className="record-editor-array__cell">{children}</td>
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

export default NestedArrayFieldItemTemplate;
