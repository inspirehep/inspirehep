import { ComponentType, useEffect, useMemo, useRef } from 'react';
import { ArrayFieldTemplateProps } from '@rjsf/utils';
import { Input, Pagination, Radio } from 'antd';
import { useFieldOnChange } from '../../../FieldOnChangeContext';
import { ArrayAddItemContext } from '../../../ArrayAddItemContext';
import ActionsDropdown from '../ActionsDropdown';
import usePagination from '../../../hooks/usePagination';
import useSearchAndFilter from '../../../hooks/useSearchAndFilter';
import { ToolbarActionsProps } from '../../../types';
import { DisplayAsListItemContext } from '../../../DisplayAsListItemContext';

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
  const getItemSuffix = options.getItemSuffix as
    | ((item: any) => string | undefined)
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
  const list: any[] = useMemo(() => formData ?? [], [formData]);

  const { setPage, resetPage, paginate } = usePagination(pageSize);

  const {
    isFiltering,
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

  const newItemIndex = useRef<number | null>(null);
  const addAt = (index: number) => {
    newItemIndex.current = index;
    (onAddClick as (event: undefined, index: number) => void)(undefined, index);
  };

  const itemsRef = useRef<HTMLDivElement>(null);
  const scrollToLastOnGrowth = useRef(false);

  useEffect(() => {
    newItemIndex.current = null;
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
    newItemIndex.current = list.length;
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
  const renderedItems = hasToolbar
    ? renderedIndexes.map((index) => items[index])
    : items;

  const itemContext = useMemo(
    () =>
      getItemBrief && needsEdit
        ? {
            isNewItem: (index: number) => newItemIndex.current === index,
            getItemInfo: (index: number) => {
              const item = list[index];
              return {
                brief: getItemBrief(item),
                href: getItemHref?.(item),
                suffix: getItemSuffix?.(item),
                flagged: needsEdit(item),
              };
            },
          }
        : undefined,
    [list, getItemBrief, getItemHref, getItemSuffix, needsEdit]
  );

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
      <ArrayAddItemContext.Provider
        value={{ addAt, addAtDisabled: isFiltering }}
      >
        <DisplayAsListItemContext.Provider value={itemContext}>
          <div ref={itemsRef}>{renderedItems}</div>
        </DisplayAsListItemContext.Provider>
      </ArrayAddItemContext.Provider>
      <div className="field-errors">{rawErrors}</div>
    </div>
  );
}

export default DisplayAsListArrayFieldTemplate;
