import React from 'react';
import { shallow } from 'enzyme';

import SecondaryButton from '../SecondaryButton';

describe('SecondaryButton', () => {
  it('renders button', () => {
    const wrapper = shallow(
      <SecondaryButton onClick={jest.fn()}>Test</SecondaryButton>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onClick when button is clicked', () => {
    const onClick = jest.fn();
    const wrapper = shallow(
      <SecondaryButton onClick={onClick}>Test</SecondaryButton>
    );
    wrapper.find('button').simulate('click');
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
