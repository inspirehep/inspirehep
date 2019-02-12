import React from 'react';
import { shallow } from 'enzyme';
import { Button } from 'antd';

import ListItemAction from '../ListItemAction';

describe('ListItemAction', () => {
  it('renders with link (href and target)', () => {
    const wrapper = shallow(
      <ListItemAction
        iconType="info"
        text="Test"
        link={{
          href: '//example.com',
          target: '_blank',
        }}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with link (to) by using Router.Link', () => {
    const wrapper = shallow(
      <ListItemAction
        iconType="info"
        text="Test"
        link={{
          to: '/relative/link',
        }}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with onClick', () => {
    const wrapper = shallow(
      <ListItemAction iconType="info" text="Test" onClick={jest.fn()} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onClick when button is clicked', () => {
    const onClick = jest.fn();
    const wrapper = shallow(
      <ListItemAction iconType="info" text="Test" onClick={onClick} />
    );
    const onButtonClick = wrapper.find(Button).prop('onClick');
    onButtonClick();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
