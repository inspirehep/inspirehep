import { useMemo, useState } from 'react';

export type ListFilter = 'all' | 'toEdit';

function getSearchText<T>(item: T): string {
  return JSON.stringify(item ?? '').toLowerCase();
}

interface UseSearchAndFilterOptions<T> {
  list: T[];
  needsEdit?: (item: T) => boolean;
  onCriteriaChange?: () => void;
}

function useSearchAndFilter<T>({
  list,
  needsEdit,
  onCriteriaChange,
}: UseSearchAndFilterOptions<T>) {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilterState] = useState<ListFilter>('all');

  const toEditCount = useMemo(
    () => (needsEdit ? list.filter(needsEdit).length : 0),
    [list, needsEdit]
  );

  const visibleIndexes = useMemo(() => {
    const query = search.trim().toLowerCase();
    return list
      .map((_, index) => index)
      .filter(
        (index) =>
          (filter === 'all' || !needsEdit || needsEdit(list[index])) &&
          (!query || getSearchText(list[index]).includes(query))
      );
  }, [list, search, filter, needsEdit]);

  const onSearchInputChange = (value: string) => {
    setSearchInput(value);
    if (!value) {
      setSearch('');
      onCriteriaChange?.();
    }
  };

  const onSearch = (value: string) => {
    setSearch(value);
    onCriteriaChange?.();
  };

  const setFilter = (value: ListFilter) => {
    setFilterState(value);
    onCriteriaChange?.();
  };

  const resetCriteria = () => {
    setSearchInput('');
    setSearch('');
    setFilterState('all');
    onCriteriaChange?.();
  };

  return {
    resetCriteria,
    searchInput,
    onSearchInputChange,
    onSearch,
    filter,
    setFilter,
    toEditCount,
    visibleIndexes,
  };
}

export default useSearchAndFilter;
