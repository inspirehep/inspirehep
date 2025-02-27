import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import SearchBoxNamespaceSelect from '../SearchBoxNamespaceSelect';

describe('SearchBoxNamespaceSelect', () => {
  it('render initial state with all props set', () => {
    const { asFragment } = render(
      <SearchBoxNamespaceSelect
        onSearchScopeChange={jest.fn()}
        searchScopeName="authors"
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls onSearchScopeChange on select change', () => {
    const onSearchScopeChange = jest.fn();
    const { getByRole, getByText } = render(
      <SearchBoxNamespaceSelect
        searchScopeName="literature"
        onSearchScopeChange={onSearchScopeChange}
      />
    );

    const selectBox = getByRole('combobox');
    fireEvent.mouseDown(selectBox);
    const newScopeOption = getByText('jobs');
    fireEvent.click(newScopeOption);
    expect(onSearchScopeChange).toBeCalledWith('jobs', expect.any(Object));
  });
});
