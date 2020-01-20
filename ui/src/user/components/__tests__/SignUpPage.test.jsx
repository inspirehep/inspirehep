import React from 'react';
import { shallow } from 'enzyme';

import SignUpPage from '../SignUpPage';

describe('SignUpPage', () => {
  it('renders page', () => {
    const wrapper = shallow(
      <SignUpPage loading={false} onSubmit={jest.fn()} />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders page with loading', () => {
    const wrapper = shallow(<SignUpPage loading onSubmit={jest.fn()} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders page with errors', () => {
    const error = {
      message: 'This is an error yo',
    };
    const wrapper = shallow(
      <SignUpPage loading={false} errors={error} onSubmit={jest.fn()} />
    );

    expect(wrapper).toMatchSnapshot();
  });
});
