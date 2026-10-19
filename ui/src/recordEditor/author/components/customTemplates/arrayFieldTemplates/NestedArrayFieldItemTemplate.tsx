import { useContext } from 'react';
import { ArrayFieldItemTemplateProps } from '@rjsf/utils';
import { Button } from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CloseOutlined,
} from '@ant-design/icons';

import NestedArrayRowLabelContext from './NestedArrayRowLabelContext';

function NestedArrayFieldItemTemplate({
  children,
  buttonsProps,
  index,
  readonly,
}: ArrayFieldItemTemplateProps) {
  const rowLabelCell = useContext(NestedArrayRowLabelContext);
  const canReorder = buttonsProps.hasMoveUp || buttonsProps.hasMoveDown;

  return (
    <tr>
      {index === 0 && rowLabelCell}
      <td className="record-editor-array__cell">{children}</td>
      <td className="record-editor-array__reorder-col">
        {canReorder && (
          <>
            <Button
              type="text"
              aria-label="Move up"
              icon={<ArrowUpOutlined />}
              onClick={buttonsProps.onMoveUpItem}
              disabled={readonly || !buttonsProps.hasMoveUp}
            />
            <Button
              type="text"
              aria-label="Move down"
              icon={<ArrowDownOutlined />}
              onClick={buttonsProps.onMoveDownItem}
              disabled={readonly || !buttonsProps.hasMoveDown}
            />
          </>
        )}
      </td>
      <td className="record-editor-array__actions-col">
        {buttonsProps.hasRemove && (
          <Button
            type="text"
            aria-label="Remove item"
            icon={<CloseOutlined />}
            onClick={buttonsProps.onRemoveItem}
            disabled={readonly}
          />
        )}
      </td>
    </tr>
  );
}

export default NestedArrayFieldItemTemplate;
