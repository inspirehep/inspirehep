import React from 'react';
import { shallow } from 'enzyme';

import { getStore } from '../../../../fixtures/store';
import {} from '../../../../actions/actionTypes';
import LoginPage from '../LoginPage';

describe('LoginPage', () => {
  it('renders page', () => {
    const store = getStore();
    const wrapper = shallow(<LoginPage store={store} />).dive();
    expect(wrapper).toMatchSnapshot();
  });

  // TODO: test login dispatch
});
