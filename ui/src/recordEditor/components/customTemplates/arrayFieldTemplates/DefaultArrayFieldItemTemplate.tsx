import { ArrayFieldItemTemplateProps } from '@rjsf/utils';
import RemoveItemButton from './RemoveItemButton';
import ReorderButtons from './ReorderButtons';

function DefaultArrayFieldItemTemplate({
  children,
  buttonsProps,
  readonly,
}: ArrayFieldItemTemplateProps) {
  const canReorder = buttonsProps.hasMoveUp || buttonsProps.hasMoveDown;

  return (
    <tr>
      {children}
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

export default DefaultArrayFieldItemTemplate;
