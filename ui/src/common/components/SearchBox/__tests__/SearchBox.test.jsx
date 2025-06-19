import { fireEvent, render } from '@testing-library/react';
import { Provider } from 'react-redux';

import SearchBox from '../SearchBox';
import { LITERATURE_NS } from '../../../../search/constants';
import { getStore } from '../../../../fixtures/store';

describe('SearchBox', () => {
  it('render initial state with all props set', () => {
    const { asFragment } = render(
      <Provider store={getStore()}>
        <SearchBox
          namespace={LITERATURE_NS}
          value="value"
          placeholder="placeholder"
          searchScopeName="scope"
          onSearch={jest.fn()}
        />
      </Provider>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders new value on change', () => {
    const { getByTestId } = render(
      <Provider store={getStore()}>
        <SearchBox
          value="value"
          namespace={LITERATURE_NS}
          onSearch={jest.fn()}
        />
      </Provider>
    );
    const input = getByTestId('search-box-input');
    fireEvent.change(input, { target: { value: 'new' } });
    expect(input).toHaveValue('new');
  });

  it('overrides internal state with prop', () => {
    const { rerender, getByTestId } = render(
      <Provider store={getStore()}>
        <SearchBox
          value="internal"
          namespace={LITERATURE_NS}
          onSearch={jest.fn()}
        />
      </Provider>
    );

    const input = getByTestId('search-box-input');

    fireEvent.change(input, { target: { value: 'internal' } });
    expect(input).toHaveValue('internal');

    rerender(
      <Provider store={getStore()}>
        <SearchBox
          value="prop"
          namespace={LITERATURE_NS}
          onSearch={jest.fn()}
        />
      </Provider>
    );

    expect(input).toHaveValue('prop');
  });
});
