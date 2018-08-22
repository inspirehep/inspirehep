import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import { getStoreWithState } from '../../../fixtures/store';
import SearchPage from '../SearchPage';

describe('Literature - SearchPage', () => {
  it('renders with loading false', () => {
    const store = getStoreWithState({ search: fromJS({ loading: false }) });
    const wrapper = shallow(<SearchPage store={store} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with loading true', () => {
    const store = getStoreWithState({ search: fromJS({ loading: true }) });
    const wrapper = shallow(<SearchPage store={store} />);
    expect(wrapper).toMatchSnapshot();
  });
});
