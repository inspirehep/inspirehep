import { fromJS } from 'immutable';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../../fixtures/render';
import { getStore } from '../../../fixtures/store';
import SearchBoxNamespaceSelectContainer from '../SearchBoxNamespaceSelectContainer';
import { CHANGE_SEARCH_BOX_NAMESPACE } from '../../../actions/actionTypes';
import { AUTHORS_NS } from '../../../search/constants';

describe('SearchBoxNamespaceSelectContainer', () => {
  it('passes url query q param to SearchBox', () => {
    const searchBoxNamespace = AUTHORS_NS;
    const store = getStore({
      search: fromJS({
        searchBoxNamespace,
      }),
    });
    const { getByText } = renderWithProviders(
      <SearchBoxNamespaceSelectContainer />,
      {
        store,
      }
    );

    expect(getByText(AUTHORS_NS)).toBeInTheDocument();
  });

  it('dispatches CHANGE_SEARCH_BOX_NAMESPACE on change', async () => {
    const user = userEvent.setup();
    const searchBoxNamespace = AUTHORS_NS;
    const store = getStore();

    const screen = renderWithProviders(<SearchBoxNamespaceSelectContainer />, {
      store,
    });

    const select = screen.getByTestId('select-box');
    await user.click(select);
    await user.click(screen.getByText('authors'));

    const expectedActions = [
      {
        type: CHANGE_SEARCH_BOX_NAMESPACE,
        payload: { searchBoxNamespace },
      },
    ];

    await waitFor(() => expect(store.getActions()).toEqual(expectedActions));
  });
});
