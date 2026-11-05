import { useContext } from 'react';
import { ArrayFieldItemTemplateProps } from '@rjsf/utils';

import NestedArrayRowLabelContext from './NestedArrayRowLabelContext';
import RemoveItemButton from './RemoveItemButton';
import ReorderButtons from './ReorderButtons';

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
          <ReorderButtons
            onMoveDownItem={buttonsProps.onMoveDownItem}
            onMoveUpItem={buttonsProps.onMoveUpItem}
            readonly={readonly ?? false}
            hasMoveDown={buttonsProps.hasMoveDown}
            hasMoveUp={buttonsProps.hasMoveUp}
          />
        )}
      </td>
      <td className="record-editor-array__actions-col">
        {buttonsProps.hasRemove && (
          <RemoveItemButton
            onClick={buttonsProps.onRemoveItem}
            disabled={readonly ?? false}
          />
        )}
      </td>
    </tr>
  );
}

export default NestedArrayFieldItemTemplate;
