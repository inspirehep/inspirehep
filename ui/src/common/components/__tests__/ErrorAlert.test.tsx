import React from 'react';
import { shallow } from 'enzyme';

import ErrorAlert from '../ErrorAlert';

describe('ErrorAlert', () => {
  it('renders with custom message', () => {
    const wrapper = shallow(
      <ErrorAlert message="Terrible thing is happening!" />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with default message', () => {
    const wrapper = shallow(<ErrorAlert />);
    expect(wrapper).toMatchSnapshot();
  });
});
