import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import { getStoreWithState, getStore } from '../../../fixtures/store';
import { SEARCH_REQUEST } from '../../../actions/actionTypes';
import PaginationContainer, { dispatchToProps } from '../PaginationContainer';

describe('PaginationContainer', () => {
  it('renders initially with all state', () => {
    const store = getStoreWithState({
      router: {
        location: {
          query: {
            size: '25',
            page: '2',
          },
        },
      },
      search: fromJS({
        total: 100,
      }),
    });
    const wrapper = shallow(<PaginationContainer store={store} />).dive();
    expect(wrapper).toMatchSnapshot();
  });

  it('dispatches search onPageChange', () => {
    const store = getStore();
    const page = 3;
    const props = dispatchToProps(store.dispatch);
    props.onPageChange(page);
    const actions = store.getActions();
    const expectedAction = actions.find(
      action => action.type === SEARCH_REQUEST
    );
    expect(expectedAction).toBeDefined();
    expect(expectedAction.payload).toEqual({ page: 3 });
  });
});
