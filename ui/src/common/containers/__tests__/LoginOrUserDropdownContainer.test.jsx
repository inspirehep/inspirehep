import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import { getStoreWithState } from '../../../fixtures/store';
import LoginOrUserDropdownContainer from '../LoginOrUserDropdownContainer';

describe('LoginOrUserDropdownContainer', () => {
  it('renders login link if not loggedIn', () => {
    const store = getStoreWithState({
      user: fromJS({
        loggedIn: false,
      }),
    });
    const wrapper = shallow(
      <LoginOrUserDropdownContainer store={store} />
    ).dive();
    expect(wrapper).toMatchSnapshot();
  });

  it('renders user actions dropdown if loggedIn', () => {
    const store = getStoreWithState({
      user: fromJS({
        loggedIn: true,
      }),
    });
    const wrapper = shallow(
      <LoginOrUserDropdownContainer store={store} />
    ).dive();
    expect(wrapper).toMatchSnapshot();
  });
});
