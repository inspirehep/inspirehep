import React from 'react';
import { shallow } from 'enzyme';

import LinkLikeButton from '../LinkLikeButton';


describe('LinkLikeButton', () => {
  
  it('renders with required props', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <LinkLikeButton onClick={jest.fn()}>example</LinkLikeButton>
    );
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('renders with dataTestId', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <LinkLikeButton onClick={jest.fn()} dataTestId="example-button">
        example
      </LinkLikeButton>
    );
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('calls onClick when anchor is clicked', () => {
    
    const onClick = jest.fn();
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <LinkLikeButton onClick={onClick}>example</LinkLikeButton>
    );
    wrapper.find('a').simulate('click');
    
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
