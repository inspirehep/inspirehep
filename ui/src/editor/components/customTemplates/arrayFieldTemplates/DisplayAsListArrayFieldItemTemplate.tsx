import { ArrayFieldItemTemplateProps } from '@rjsf/utils';
import { ArrayItemRemoveContext } from '../../../ArrayItemRemoveContext';
import AddElementHereButton from './AddElementHereButton';
import ReorderButtons from './ReorderButtons';

function DisplayAsListArrayFieldItemTemplate({
  children,
  buttonsProps,
  readonly,
  index,
}: ArrayFieldItemTemplateProps) {
  const canReorder = buttonsProps.hasMoveUp || buttonsProps.hasMoveDown;
  return (
    <>
      <AddElementHereButton index={index} readonly={readonly} />
      <div className="editor-field__item">
        <ArrayItemRemoveContext.Provider
          value={{ remove: buttonsProps.onRemoveItem }}
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
