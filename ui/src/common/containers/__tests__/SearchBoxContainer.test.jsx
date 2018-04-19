import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';

import { getStoreWithState, getStore } from '../../../fixtures/store';
import { SEARCHING } from '../../../actions/actionTypes';
import SearchBoxContainer, { dispatchToProps } from '../SearchBoxContainer';

describe('SearchBoxContainer', () => {
  it('renders initial state with initial url query q param', () => {
    const store = getStoreWithState({
      router: { location: { query: { q: 'test' } } },
    });
    const wrapper = mount((
      <Provider store={store}>
        <SearchBoxContainer />
      </Provider>
    ));
    expect(wrapper).toMatchSnapshot();
  });

  it('dispatches search onSearch', () => {
    const store = getStore();
    const props = dispatchToProps(store.dispatch);
    props.onSearch();
    const actions = store.getActions();
    expect(actions.some(action => action.type === SEARCHING)).toBe(true);
  });
});
