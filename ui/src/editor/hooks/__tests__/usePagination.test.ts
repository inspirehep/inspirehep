import { act, renderHook } from '@testing-library/react';

import usePagination from '../usePagination';

const items = Array.from({ length: 5 }, (_, i) => i);

describe('usePagination', () => {
  it('returns the first page by default', () => {
    const { result } = renderHook(() => usePagination(2));
    expect(result.current.paginate(items)).toEqual({
      pageItems: [0, 1],
      currentPage: 1,
      total: 5,
    });
  });

  it('changes page', () => {
    const { result } = renderHook(() => usePagination(2));
    act(() => result.current.setPage(3));
    expect(result.current.paginate(items).pageItems).toEqual([4]);
  });

  it('clamps the page when there are fewer items', () => {
    const { result } = renderHook(() => usePagination(2));
    act(() => result.current.setPage(3));
    const { pageItems, currentPage } = result.current.paginate([0, 1, 2]);
    expect(currentPage).toBe(2);
    expect(pageItems).toEqual([2]);
  });

  it('has a single empty page without items', () => {
    const { result } = renderHook(() => usePagination(2));
    expect(result.current.paginate([])).toEqual({
      pageItems: [],
      currentPage: 1,
      total: 0,
    });
  });

  it('resets to the first page', () => {
    const { result } = renderHook(() => usePagination(2));
    act(() => result.current.setPage(2));
    act(() => result.current.resetPage());
    expect(result.current.paginate(items).currentPage).toBe(1);
  });

  it('does not truncate the items without page size', () => {
    const many = Array.from({ length: 100 }, (_, i) => i);
    const { result } = renderHook(() => usePagination());
    expect(result.current.paginate(many)).toEqual({
      pageItems: many,
      currentPage: 1,
      total: 100,
    });
  });
});
