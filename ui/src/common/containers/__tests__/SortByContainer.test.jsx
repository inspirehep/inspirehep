import React from 'react';
import { mount } from 'enzyme';

import { getStoreWithState } from '../../../fixtures/store';
import SortByContainer, { dispatchToProps } from '../SortByContainer';
import * as search from '../../../actions/search';
import SortBy from '../../components/SortBy';

jest.mock('../../../actions/search');

describe('SortByContainer', () => {
  it('passes location query sort param to SortBy', () => {
    const store = getStoreWithState({
      router: { location: { query: { sort: 'mostrecent' } } },
    });
    const wrapper = mount(<SortByContainer store={store} />);
    expect(wrapper.find(SortBy)).toHaveProp('sort', 'mostrecent');
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
