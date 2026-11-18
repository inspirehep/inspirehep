import { ArrayFieldItemTemplateProps } from '@rjsf/utils';
import { Button, Collapse } from 'antd';
import { CheckCircleFilled, WarningFilled } from '@ant-design/icons';
import {
  useDisplayAsListItemInfo,
  useIsNewDisplayAsListItem,
} from '../../../DisplayAsListItemContext';
import { ArrayItemRemoveContext } from '../../../ArrayItemRemoveContext';
import AddElementHereButton from './AddElementHereButton';
import ReorderButtons from './ReorderButtons';

function DisplayAsListCollapsibleArrayFieldItemTemplate({
  children,
  buttonsProps,
  readonly,
  index,
}: ArrayFieldItemTemplateProps) {
  const { brief, href, flagged } = useDisplayAsListItemInfo(index) ?? {
    brief: '',
    flagged: false,
  };
  const isNew = useIsNewDisplayAsListItem(index);
  const canReorder = buttonsProps.hasMoveUp || buttonsProps.hasMoveDown;

  return (
    <>
      <AddElementHereButton index={index} readonly={readonly} />
      <div
        className="editor-field__item editor-list__item"
        data-testid="list-item"
      >
        <ArrayItemRemoveContext.Provider
          value={{ remove: buttonsProps.onRemoveItem }}
        >
          <Collapse
            size="small"
            defaultActiveKey={isNew ? ['item'] : []}
            items={[
              {
                key: 'item',
                label: (
                  <span className="editor-list__brief">
                    {flagged ? (
                      <WarningFilled
                        className="editor-list__status editor-list__status--warning"
                        title="Needs edition"
                        aria-label="needs edition"
                      />
                    ) : (
                      <CheckCircleFilled
                        className="editor-list__status editor-list__status--ok"
                        title="No edition needed"
                        aria-label="valid"
                      />
                    )}
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {brief}
                      </a>
                    ) : (
                      brief
                    )}
                  </span>
                ),
                extra: (
                  <span
                    onClick={(event) => event.stopPropagation()}
                    role="presentation"
                  >
                    {canReorder && (
                      <ReorderButtons
                        onMoveDownItem={buttonsProps.onMoveDownItem}
                        onMoveUpItem={buttonsProps.onMoveUpItem}
                        readonly={readonly ?? false}
                        hasMoveDown={buttonsProps.hasMoveDown}
                        hasMoveUp={buttonsProps.hasMoveUp}
                      />
                    )}
                    <Button
                      type="link"
                      danger
                      size="small"
                      disabled={readonly}
                      onClick={buttonsProps.onRemoveItem}
                    >
                      Delete
                    </Button>
                  </span>
                ),
                children,
              },
            ]}
          />
        </ArrayItemRemoveContext.Provider>
      </div>
    </>
  );
}

export default DisplayAsListCollapsibleArrayFieldItemTemplate;
