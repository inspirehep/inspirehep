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
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ loading: false; errors: { message: string;... Remove this comment to see the full error message
      <SignUpPage loading={false} errors={error} onSubmit={jest.fn()} />
    );

    expect(wrapper).toMatchSnapshot();
  });
});
