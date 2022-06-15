import React from 'react';
import { shallow } from 'enzyme';

import SecondaryButton from '../SecondaryButton';


describe('SecondaryButton', () => {
  
  it('renders button', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <SecondaryButton onClick={jest.fn()}>Test</SecondaryButton>
    );
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('calls onClick when button is clicked', () => {
    
    const onClick = jest.fn();
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <SecondaryButton onClick={onClick}>Test</SecondaryButton>
    );
    wrapper.find('button').simulate('click');
    
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
