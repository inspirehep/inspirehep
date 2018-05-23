import React from 'react';
import { shallow } from 'enzyme';

import ListItemAction from '../ListItemAction';

describe('ListItemAction', () => {
  it('renders with link (href and target)', () => {
    const wrapper = shallow((
      <ListItemAction
        iconType="info"
        text="Test"
        link={{
          href: '//example.com',
          target: '_blank',
        }}
      />
    ));
    expect(wrapper).toMatchSnapshot();
  });


  it('renders with link (to) by using Router.Link', () => {
    const wrapper = shallow((
      <ListItemAction
        iconType="info"
        text="Test"
        link={{
          to: '/relative/link',
        }}
      />
    ));
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with onClick', () => {
    const wrapper = shallow((
      <ListItemAction
        iconType="info"
        text="Test"
        onClick={jest.fn()}
      />
    ));
    expect(wrapper).toMatchSnapshot();
  });
});
