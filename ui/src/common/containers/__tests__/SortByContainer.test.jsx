import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';

import { getStoreWithState, getStore } from '../../../fixtures/store';
import { SEARCHING } from '../../../actions/actionTypes';
import SortByContainer, { dispatchToProps } from '../SortByContainer';

describe('SortByContainer', () => {
  it('renders initial state with initial url query q param', () => {
    const store = getStoreWithState({
      router: { location: { query: { sort: 'mostrecent' } } },
    });
    const wrapper = mount((
      <Provider store={store}>
        <SortByContainer />
      </Provider>
    ));
    expect(wrapper).toMatchSnapshot();
  });

  it('dispatches search onSortChange', () => {
    const store = getStore();
    const props = dispatchToProps(store.dispatch);
    props.onSortChange();
    const actions = store.getActions();
    expect(actions.some(action => action.type === SEARCHING)).toBe(true);
  });
});
