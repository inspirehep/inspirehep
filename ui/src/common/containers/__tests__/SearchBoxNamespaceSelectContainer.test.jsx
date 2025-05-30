import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';
import { render } from '@testing-library/react';

import { getStore } from '../../../fixtures/store';
import SearchBoxNamespaceSelectContainer from '../SearchBoxNamespaceSelectContainer';
import SearchBoxNamespaceSelect from '../../components/SearchBoxNamespaceSelect';
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
    const wrapper = mount(
      <Provider store={store}>
        <SearchBoxNamespaceSelectContainer />
      </Provider>
    );
    const onSearchScopeChange = wrapper
      .find(SearchBoxNamespaceSelect)
      .prop('onSearchScopeChange');
    onSearchScopeChange(searchBoxNamespace);
    const expectedActions = [
      {
        type: CHANGE_SEARCH_BOX_NAMESPACE,
        payload: { searchBoxNamespace },
      },
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
