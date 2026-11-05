import { ArrayFieldItemTemplateProps } from '@rjsf/utils';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useArrayAddItem } from '../../../ArrayAddItemContext';
import { ArrayItemRemoveContext } from '../../../ArrayItemRemoveContext';
import ReorderButtons from './ReorderButtons';

function DisplayAsListArrayFieldItemTemplate({
  children,
  buttonsProps,
  readonly,
  index,
}: ArrayFieldItemTemplateProps) {
  const addAt = useArrayAddItem()?.addAt;
  const canReorder = buttonsProps.hasMoveUp || buttonsProps.hasMoveDown;

  return (
    <>
      {addAt && (
        <Button
          type="link"
          icon={<PlusOutlined />}
          onClick={() => addAt(index)}
          disabled={readonly}
        >
          Add new element here
        </Button>
      )}
      <div className="record-editor-field__item">
        <ArrayItemRemoveContext.Provider
          value={{
            remove: buttonsProps.onRemoveItem,
          }}
        >
          {canReorder && (
            <div className="flex justify-end pb1">
              <ReorderButtons
                onMoveDownItem={buttonsProps.onMoveDownItem}
                onMoveUpItem={buttonsProps.onMoveUpItem}
                readonly={readonly ?? false}
                hasMoveDown={buttonsProps.hasMoveDown}
                hasMoveUp={buttonsProps.hasMoveUp}
              />
            </div>
          )}
          <div>{children}</div>
        </ArrayItemRemoveContext.Provider>
      </div>
    </>
  );
}

export default DisplayAsListArrayFieldItemTemplate;
