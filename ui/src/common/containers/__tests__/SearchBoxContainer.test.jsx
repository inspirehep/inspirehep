import React from 'react';
import { shallow } from 'enzyme';
import { CALL_HISTORY_METHOD } from 'react-router-redux';

import { getStoreWithState, getStore } from '../../../fixtures/store';
import { SEARCH_REQUEST } from '../../../actions/actionTypes';
import SearchBoxContainer, { dispatchToProps } from '../SearchBoxContainer';

describe('SearchBoxContainer', () => {
  it('renders initial state with initial url query q param', () => {
    const store = getStoreWithState({
      router: { location: { query: { q: 'test' } } },
    });
    const wrapper = shallow(<SearchBoxContainer store={store} />).dive();
    expect(wrapper).toMatchSnapshot();
  });

  it('dispatches search onSearch', () => {
    const store = getStore();
    const value = 'test';
    const props = dispatchToProps(store.dispatch);
    props.onSearch(value);
    const actions = store.getActions();
    const searchRequestAction = actions.find(
      action => action.type === SEARCH_REQUEST
    );
    expect(searchRequestAction).toBeDefined();
    expect(searchRequestAction.payload).toEqual({ q: value });
  });

  it('clears existing search params onSearch', () => {
    const store = getStoreWithState({
      router: { location: { query: { another: 'value' } } },
    });
    const value = 'test';
    const props = dispatchToProps(store.dispatch);
    props.onSearch(value);
    const actions = store.getActions();
    const searchUrlPushAction = actions.find(
      action => action.type === CALL_HISTORY_METHOD
    );
    expect(searchUrlPushAction).toBeDefined();
    const searchUrl = searchUrlPushAction.payload.args[0];
    expect(searchUrl).not.toMatch('another');
  });
});
