import React from 'react';
import { shallow } from 'enzyme';
import { Button } from 'antd';

import LoginPage from '../LoginPage';

jest.mock('../../../../actions/user');

describe('LoginPage', () => {
  it('renders page', () => {
    const wrapper = shallow(
      <LoginPage onLoginClick={jest.fn()} previousUrl="/" />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('passes previousUrl as next query parameter', () => {
    const previousUrl = '/jobs?q=CERN';
    const wrapper = shallow(<LoginPage previousUrl={previousUrl} />);
    const href = wrapper.find(Button).prop('href');
    expect(href).toContain(previousUrl);
  });
});
