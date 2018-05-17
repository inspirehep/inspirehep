import React from 'react';
import { shallow } from 'enzyme';

import { getStoreWithState, getStore } from '../../../fixtures/store';
import { SEARCH_REQUEST } from '../../../actions/actionTypes';
import SearchBoxContainer, { dispatchToProps } from '../SearchBoxContainer';

describe('SearchBoxContainer', () => {
  it('renders initial state with initial url query q param', () => {
    const store = getStoreWithState({
      router: { location: { query: { q: 'test' } } },
    });
    const wrapper = shallow((
      <SearchBoxContainer store={store} />
    )).dive();
    expect(wrapper).toMatchSnapshot();
  });

  it('dispatches search onSearch', () => {
    const store = getStore();
    const props = dispatchToProps(store.dispatch);
    props.onSearch();
    const actions = store.getActions();
    expect(actions.some(action => action.type === SEARCH_REQUEST)).toBe(true);
  });
});
