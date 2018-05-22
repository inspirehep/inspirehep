import React from 'react';
import { shallow } from 'enzyme';

import ListItemAction from '../ListItemAction';

describe('ListItemAction', () => {
  it('renders with href', () => {
    const wrapper = shallow((
      <ListItemAction
        iconType="info"
        text="Test"
        href="//example.com"
        target="_blank"
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
