import { ArrayFieldItemTemplateProps } from '@rjsf/utils';

import { ArrayItemRemoveContext } from '../../../ArrayItemRemoveContext';

function DisplayAsListArrayFieldItemTemplate({
  children,
  buttonsProps,
}: ArrayFieldItemTemplateProps) {
  return (
    <div className="record-editor-field__item">
      <ArrayItemRemoveContext.Provider
        value={{
          canRemove: buttonsProps.hasRemove,
          remove: buttonsProps.onRemoveItem,
        }}
      >
        <div>{children}</div>
      </ArrayItemRemoveContext.Provider>
    </div>
  );
}

export default DisplayAsListArrayFieldItemTemplate;
