import {
  cloneElement,
  ComponentType,
  ReactElement,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { ArrayFieldTemplateProps } from '@rjsf/utils';
import { Input, Pagination, Radio } from 'antd';
import { useFieldOnChange } from '../../../FieldOnChangeContext';
import { ArrayAddItemContext } from '../../../ArrayAddItemContext';
import ActionsDropdown from '../ActionsDropdown';
import usePagination from '../../../hooks/usePagination';
import useSearchAndFilter from '../../../hooks/useSearchAndFilter';
import { ToolbarActionsProps } from '../../../types';
import type { DisplayAsListItemProps } from './DisplayAsListCollapsibleArrayFieldItemTemplate';

function DisplayAsListArrayFieldTemplate({
  title,
  items,
  onAddClick,
  uiSchema,
  rawErrors,
  readonly,
  formData,
}: ArrayFieldTemplateProps) {
  const options = uiSchema?.['ui:options'] ?? {};
  const pageSize = options.pageSize as number | undefined;
  const searchable = !!options.searchable;
  const getItemBrief = options.getItemBrief as
    | ((item: any) => string)
    | undefined;
  const getItemHref = options.getItemHref as
    | ((item: any) => string | undefined)
    | undefined;
  const needsEdit = options.needsEdit as ((item: any) => boolean) | undefined;
  const ToolbarActions = options.toolbarActions as
    | ComponentType<ToolbarActionsProps>
    | undefined;

  const hasToolbar =
    searchable || !!pageSize || !!needsEdit || !!ToolbarActions;
  const displayTitle = (uiSchema?.['ui:title'] as string | undefined) ?? title;
  const onFieldChange = useFieldOnChange();
  const addAt = (index: number) =>
    (onAddClick as (event: undefined, index: number) => void)(undefined, index);

  const list: any[] = useMemo(() => formData ?? [], [formData]);

  const { setPage, resetPage, paginate } = usePagination(pageSize);

  const {
    searchInput,
    onSearchInputChange,
    onSearch,
    resetCriteria,
    filter,
    setFilter,
    toEditCount,
    visibleIndexes,
  } = useSearchAndFilter({
    list,
    needsEdit,
    onCriteriaChange: resetPage,
  });

  const itemsRef = useRef<HTMLDivElement>(null);
  const scrollToLastOnGrowth = useRef(false);

  useEffect(() => {
    if (scrollToLastOnGrowth.current) {
      scrollToLastOnGrowth.current = false;
      itemsRef.current?.lastElementChild?.scrollIntoView?.({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [list.length]);

  const onAddAtEnd = (event?: any) => {
    scrollToLastOnGrowth.current = true;
    resetCriteria();
    if (pageSize) {
      setPage(Math.max(1, Math.ceil((list.length + 1) / pageSize)));
    }
    (onAddClick as (event?: any) => void)(event);
  };

  const {
    pageItems: renderedIndexes,
    currentPage,
    total,
  } = paginate(visibleIndexes);
  const renderedItems = (
    hasToolbar ? renderedIndexes : items.map((_, index) => index)
  ).map((index) => {
    const element = items[index] as ReactElement<
      Partial<DisplayAsListItemProps>
    >;
    if (!getItemBrief || !needsEdit) {
      return element;
    }
    const item = list[index];
    return cloneElement(element, {
      brief: getItemBrief(item),
      href: getItemHref?.(item),
      flagged: needsEdit(item),
    });
  });

  return (
    <div className="editor-field">
      <div className="editor-field__label">
        <ActionsDropdown
          onAddClick={onAddAtEnd}
          onRemoveClick={() => onFieldChange(undefined)}
          disabled={readonly ?? false}
          title={`${displayTitle} (${list.length})`}
        />
      </div>
      {hasToolbar && (
        <div className="editor-list__toolbar">
          {searchable && (
            <Input.Search
              allowClear
              size="small"
              placeholder="Search"
              className="editor-list__search"
              value={searchInput}
              onChange={(event) => onSearchInputChange(event.target.value)}
              onSearch={onSearch}
            />
          )}
          {needsEdit && (
            <Radio.Group
              size="small"
              optionType="button"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              options={[
                { label: 'All', value: 'all' },
                { label: `To edit (${toEditCount})`, value: 'toEdit' },
              ]}
            />
          )}
          {ToolbarActions && (
            <ToolbarActions
              formData={list}
              onChange={onFieldChange}
              readonly={readonly ?? false}
              onReset={resetCriteria}
            />
          )}
          {pageSize && (
            <Pagination
              simple
              size="small"
              className="editor-list__pagination"
              current={currentPage}
              pageSize={pageSize}
              total={total}
              showSizeChanger={false}
              onChange={setPage}
            />
          )}
        </div>
      )}
      <ArrayAddItemContext.Provider value={{ addAt }}>
        <div ref={itemsRef}>{renderedItems}</div>
      </ArrayAddItemContext.Provider>
      <div className="field-errors">{rawErrors}</div>
    </div>
  );
}

export default DisplayAsListArrayFieldTemplate;
