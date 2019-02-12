import React from 'react';
import { shallow } from 'enzyme';
import * as search from '../../../actions/search';

import { getStoreWithState } from '../../../fixtures/store';
import SearchBoxContainer, { dispatchToProps } from '../SearchBoxContainer';

jest.mock('../../../actions/search');

describe('SearchBoxContainer', () => {
  it('renders initial state with initial url query q param', () => {
    const store = getStoreWithState({
      router: { location: { query: { q: 'test' } } },
    });
    const wrapper = shallow(<SearchBoxContainer store={store} />).dive();
    expect(wrapper).toMatchSnapshot();
  });

  it('calls pushQueryToLocation onSearch', async () => {
    const mockPushQueryToLocation = jest.fn();
    search.pushQueryToLocation = mockPushQueryToLocation;
    const props = dispatchToProps(jest.fn());
    props.onSearch('test');
    expect(mockPushQueryToLocation).toHaveBeenCalledWith({ q: 'test' }, true);
  });
});
