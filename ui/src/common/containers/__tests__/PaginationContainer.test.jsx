import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import { getStoreWithState } from '../../../fixtures/store';
import PaginationContainer, { dispatchToProps } from '../PaginationContainer';
import * as search from '../../../actions/search';

jest.mock('../../../actions/search');

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

  it('calls pushQueryToLocation onPageChange', () => {
    const mockPushQueryToLocation = jest.fn();
    search.pushQueryToLocation = mockPushQueryToLocation;
    const props = dispatchToProps(jest.fn());
    const page = 3;
    props.onPageChange(page);
    expect(mockPushQueryToLocation).toHaveBeenCalledWith({ page });
  });
});
