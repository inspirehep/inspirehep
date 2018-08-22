import React from 'react';
import { shallow } from 'enzyme';

import { getStoreWithState } from '../../../fixtures/store';
import SortByContainer, { dispatchToProps } from '../SortByContainer';
import * as search from '../../../actions/search';

jest.mock('../../../actions/search');

describe('SortByContainer', () => {
  it('renders initial state with initial url query sort param', () => {
    const store = getStoreWithState({
      router: { location: { query: { sort: 'mostrecent' } } },
    });
    const wrapper = shallow(<SortByContainer store={store} />).dive();
    expect(wrapper).toMatchSnapshot();
  });

  it('dispatches search onSortChange', () => {
    const mockPushQueryToLocation = jest.fn();
    search.pushQueryToLocation = mockPushQueryToLocation;
    const props = dispatchToProps(jest.fn());
    const sort = 'mostcited';
    props.onSortChange(sort);
    expect(mockPushQueryToLocation).toHaveBeenCalledWith({ sort });
  });
});
