import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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

  it('renders new value on change', async () => {
    const user = userEvent.setup();
    const { getByTestId } = renderWithProviders(
      <SearchBox value="value" namespace={LITERATURE_NS} onSearch={jest.fn()} />
    );
    const input = within(getByTestId('search-box-input')).getByRole('combobox');
    await user.clear(input);
    await user.type(input, 'new');
    expect(input).toHaveValue('new');
  });

  it('overrides internal state with prop', async () => {
    const user = userEvent.setup();
    const { rerender, getByTestId } = renderWithProviders(
      <SearchBox
        value="internal"
        namespace={LITERATURE_NS}
        onSearch={jest.fn()}
      />
    );

    const input = within(getByTestId('search-box-input')).getByRole('combobox');

    await user.clear(input);
    await user.type(input, 'internal');
    expect(input).toHaveValue('internal');

    rerender(
      <SearchBox value="prop" namespace={LITERATURE_NS} onSearch={jest.fn()} />
    );

    expect(input).toHaveValue('prop');
  });
});
