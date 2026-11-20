import { act, renderHook } from '@testing-library/react';

import useSearchAndFilter from '../useSearchAndFilter';

const list = [
  { id: 1, title: 'Linked one', ok: true },
  { id: 2, title: 'Unlinked two', ok: false },
  { id: 3, title: 'Unlinked three', ok: false },
];
const needsEdit = (item: any) => !item.ok;

describe('useSearchAndFilter', () => {
  it('returns all indexes by default', () => {
    const { result } = renderHook(() => useSearchAndFilter({ list }));
    expect(result.current.visibleIndexes).toEqual([0, 1, 2]);
  });

  it('counts the items to edit', () => {
    const { result } = renderHook(() =>
      useSearchAndFilter({ list, needsEdit })
    );
    expect(result.current.toEditCount).toBe(2);
  });

  it('filters items to edit', () => {
    const { result } = renderHook(() =>
      useSearchAndFilter({ list, needsEdit })
    );
    act(() => result.current.setFilter('toEdit'));
    expect(result.current.visibleIndexes).toEqual([1, 2]);
  });

  it('does not filter on To edit without needsEdit', () => {
    const { result } = renderHook(() => useSearchAndFilter({ list }));
    act(() => result.current.setFilter('toEdit'));
    expect(result.current.visibleIndexes).toEqual([0, 1, 2]);
  });

  it('applies the search on submit only, case insensitively', () => {
    const { result } = renderHook(() => useSearchAndFilter({ list }));
    act(() => result.current.onSearchInputChange('UNLINKED'));
    expect(result.current.searchInput).toBe('UNLINKED');
    expect(result.current.visibleIndexes).toEqual([0, 1, 2]);

    act(() => result.current.onSearch('UNLINKED'));
    expect(result.current.visibleIndexes).toEqual([1, 2]);
  });

  it('resets the search when the input is cleared', () => {
    const { result } = renderHook(() => useSearchAndFilter({ list }));
    act(() => result.current.onSearchInputChange('two'));
    act(() => result.current.onSearch('two'));
    expect(result.current.visibleIndexes).toEqual([1]);

    act(() => result.current.onSearchInputChange(''));
    expect(result.current.visibleIndexes).toEqual([0, 1, 2]);
  });

  it('combines search and filter', () => {
    const { result } = renderHook(() =>
      useSearchAndFilter({ list, needsEdit })
    );
    act(() => result.current.setFilter('toEdit'));
    act(() => result.current.onSearch('three'));
    expect(result.current.visibleIndexes).toEqual([2]);
  });

  it('calls onCriteriaChange when search or filter changes', () => {
    const onCriteriaChange = vi.fn();
    const { result } = renderHook(() =>
      useSearchAndFilter({ list, needsEdit, onCriteriaChange })
    );
    act(() => result.current.onSearchInputChange('abc'));
    expect(onCriteriaChange).not.toHaveBeenCalled();

    act(() => result.current.onSearch('abc'));
    act(() => result.current.setFilter('toEdit'));
    act(() => result.current.onSearchInputChange(''));
    expect(onCriteriaChange).toHaveBeenCalledTimes(3);
  });

  it('resets search, filter and calls onCriteriaChange on resetCriteria', () => {
    const onCriteriaChange = vi.fn();
    const { result } = renderHook(() =>
      useSearchAndFilter({ list, needsEdit, onCriteriaChange })
    );
    act(() => result.current.onSearchInputChange('unlinked'));
    act(() => result.current.onSearch('unlinked'));
    act(() => result.current.setFilter('toEdit'));
    onCriteriaChange.mockClear();

    act(() => result.current.resetCriteria());

    expect(result.current.searchInput).toBe('');
    expect(result.current.filter).toBe('all');
    expect(result.current.visibleIndexes).toEqual([0, 1, 2]);
    expect(onCriteriaChange).toHaveBeenCalledTimes(1);
  });
});
