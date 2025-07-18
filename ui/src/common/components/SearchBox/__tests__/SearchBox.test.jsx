import { fireEvent } from '@testing-library/react';

import SearchBox from '../SearchBox';
import { LITERATURE_NS } from '../../../../search/constants';
import { renderWithProviders } from '../../../../fixtures/render';

describe('SearchBox', () => {
  it('render initial state with all props set', () => {
    const { asFragment } = renderWithProviders(
      <SearchBox
        namespace={LITERATURE_NS}
        value="value"
        placeholder="placeholder"
        searchScopeName="scope"
        onSearch={jest.fn()}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders new value on change', () => {
    const { getByTestId } = renderWithProviders(
      <SearchBox value="value" namespace={LITERATURE_NS} onSearch={jest.fn()} />
    );
    const input = getByTestId('search-box-input');
    fireEvent.change(input, { target: { value: 'new' } });
    expect(input).toHaveValue('new');
  });

  it('overrides internal state with prop', () => {
    const { rerender, getByTestId } = renderWithProviders(
      <SearchBox
        value="internal"
        namespace={LITERATURE_NS}
        onSearch={jest.fn()}
      />
    );

    const input = getByTestId('search-box-input');

    fireEvent.change(input, { target: { value: 'internal' } });
    expect(input).toHaveValue('internal');

    rerender(
      <SearchBox value="prop" namespace={LITERATURE_NS} onSearch={jest.fn()} />
    );

    expect(input).toHaveValue('prop');
  });
});
