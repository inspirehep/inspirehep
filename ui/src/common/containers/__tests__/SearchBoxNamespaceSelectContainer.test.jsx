import { Provider } from 'react-redux';
import { fromJS } from 'immutable';
import { fireEvent, render, waitFor } from '@testing-library/react';

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
    const { getByText } = render(
      <Provider store={store}>
        <SearchBoxNamespaceSelectContainer />
      </Provider>
    );

    expect(getByText(AUTHORS_NS)).toBeInTheDocument();
  });

  it('dispatches CHANGE_SEARCH_BOX_NAMESPACE on change', async () => {
    const searchBoxNamespace = AUTHORS_NS;
    const store = getStore();

    const screen = render(
      <Provider store={store}>
        <SearchBoxNamespaceSelectContainer />
      </Provider>
    );

    const select = document.querySelector('.ant-select-selector');
    const clickEvent = document.createEvent('MouseEvents');
    clickEvent.initEvent('mousedown', true, true);
    select.dispatchEvent(clickEvent);

    fireEvent.click(screen.getAllByText('authors')[1]);

    const expectedActions = [
      {
        type: CHANGE_SEARCH_BOX_NAMESPACE,
        payload: { searchBoxNamespace },
      },
    ];

    await waitFor(() => expect(store.getActions()).toEqual(expectedActions));
  });
});
