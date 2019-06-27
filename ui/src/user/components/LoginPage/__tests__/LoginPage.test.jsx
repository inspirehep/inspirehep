import React from 'react';
import { shallow } from 'enzyme';
import { Button } from 'antd';

import LoginPage from '../LoginPage';

jest.mock('../../../../actions/user');

describe('LoginPage', () => {
  it('renders page', () => {
    const wrapper = shallow(<LoginPage onLoginClick={jest.fn()} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('passes onLoginClick to click event of login button', () => {
    const onLoginClick = jest.fn();
    const wrapper = shallow(<LoginPage onLoginClick={onLoginClick} />);
    const onLoginButtonClick = wrapper
      .dive()
      .find(Button)
      .prop('onClick');
    expect(onLoginClick).toBe(onLoginButtonClick);
  });
});
