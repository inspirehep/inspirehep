import React from 'react';
import { shallow } from 'enzyme';
import { Button } from 'antd';

import LinkLikeButton from '../LinkLikeButton/LinkLikeButton';

describe('LinkLikeButton', () => {
  it('renders with required props', () => {
    const wrapper = shallow(
      <LinkLikeButton onClick={jest.fn()}>example</LinkLikeButton>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with dataTestId', () => {
    const wrapper = shallow(
      <LinkLikeButton onClick={jest.fn()} dataTestId="example-button">
        example
      </LinkLikeButton>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onClick when anchor is clicked', () => {
    const onClick = jest.fn();
    const wrapper = shallow(
      <LinkLikeButton onClick={onClick}>example</LinkLikeButton>
    );
    wrapper.find(Button).simulate('click');
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
