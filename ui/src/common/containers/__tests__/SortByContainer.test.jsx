import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';

import { getStoreWithState } from '../../../fixtures/store';
import SortByContainer, { dispatchToProps } from '../SortByContainer';
import { pushQueryToLocation } from '../../../actions/search';
import SortBy from '../../components/SortBy';

jest.mock('../../../actions/search');

describe('SortByContainer', () => {
  afterEach(() => {
    pushQueryToLocation.mockClear();
  });

  it('passes location query sort param to SortBy', () => {
    const store = getStoreWithState({
      router: { location: { query: { sort: 'mostrecent' } } },
    });
    const wrapper = mount(
      <Provider store={store}>
        <SortByContainer />
      </Provider>
    );
    expect(wrapper.find(SortBy)).toHaveProp({ sort: 'mostrecent' });
  });

  it('dispatches search onSortChange', () => {
    const props = dispatchToProps(jest.fn());
    const sort = 'mostcited';
    props.onSortChange(sort);
    expect(pushQueryToLocation).toHaveBeenCalledWith({ sort });
  });
});
