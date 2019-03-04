import React from 'react';
import { shallow } from 'enzyme';

import { getStoreWithState } from '../../../../fixtures/store';
import Header from '../Header';

describe('Header', () => {
  it('renders with search box if it is not on home', () => {
    const store = getStoreWithState({
      router: {
        location: {
          pathname: '/not-home',
        },
      },
    });
    const wrapper = shallow(<Header store={store} />).dive();
    expect(wrapper).toMatchSnapshot();
  });

  it('renders without search box if it is on homepage `/`', () => {
    const store = getStoreWithState({
      router: {
        location: {
          pathname: '/',
        },
      },
    });
    const wrapper = shallow(<Header store={store} />).dive();
    expect(wrapper).toMatchSnapshot();
  });
});
