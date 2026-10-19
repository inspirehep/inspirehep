import { ArrayFieldItemTemplateProps } from '@rjsf/utils';
import { Button } from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useArrayAddItem } from '../../../ArrayAddItemContext';
import { ArrayItemRemoveContext } from '../../../ArrayItemRemoveContext';

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
            </div>
          )}
          <div>{children}</div>
        </ArrayItemRemoveContext.Provider>
      </div>
    </>
  );
}

export default DisplayAsListArrayFieldItemTemplate;
