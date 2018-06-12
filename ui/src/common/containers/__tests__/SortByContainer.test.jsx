import React from 'react';
import { shallow } from 'enzyme';

import { getStoreWithState, getStore } from '../../../fixtures/store';
import { SEARCH_REQUEST } from '../../../actions/actionTypes';
import SortByContainer, { dispatchToProps } from '../SortByContainer';

describe('SortByContainer', () => {
  it('renders initial state with initial url query sort param', () => {
    const store = getStoreWithState({
      router: { location: { query: { sort: 'mostrecent' } } },
    });
    const wrapper = shallow(<SortByContainer store={store} />).dive();
    expect(wrapper).toMatchSnapshot();
  });

  it('dispatches search onSortChange', () => {
    const store = getStore();
    const sort = 'mostcited';
    const props = dispatchToProps(store.dispatch);
    props.onSortChange(sort);
    const actions = store.getActions();
    const expectedAction = actions.find(
      action => action.type === SEARCH_REQUEST
    );
    expect(expectedAction).toBeDefined();
    expect(expectedAction.payload).toEqual({ sort });
  });
});
