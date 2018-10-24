import React from 'react';
import { shallow } from 'enzyme';
import { Button } from 'antd';

import { getStore } from '../../../../fixtures/store';
import LoginPage, { dispatchToProps } from '../LoginPage';
import * as user from '../../../../actions/user';

jest.mock('../../../../actions/user');

describe('LoginPage', () => {
  it('renders page', () => {
    const store = getStore();
    const wrapper = shallow(<LoginPage store={store} />).dive();
    expect(wrapper).toMatchSnapshot();
  });

  it('dispatches login onLoginClick', () => {
    const mockUserLogin = jest.fn();
    user.userLogin = mockUserLogin;
    const props = dispatchToProps(jest.fn());
    props.onLoginClick();
    expect(mockUserLogin).toHaveBeenCalledTimes(1);
  });

  it('passes onLoginClick to click event of login button', () => {
    const store = getStore();
    const wrapper = shallow(<LoginPage store={store} />);
    const onLoginButtonClick = wrapper
      .dive()
      .find(Button)
      .prop('onClick');
    const onLoginClick = wrapper.prop('onLoginClick');
    expect(onLoginClick).toBe(onLoginButtonClick);
  });
});
