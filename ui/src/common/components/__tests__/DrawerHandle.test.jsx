import React from 'react';
import { shallow } from 'enzyme';

import DrawerHandle from '../DrawerHandle';

describe('DrawerHandle', () => {
  it('renders DrawerHandle with all props', () => {
    const wrapper = shallow(
      <DrawerHandle
        className="mt3"
        handleText="Handle"
        drawerTitle="Title"
        width={256}
      >
        <div>Content</div>
      </DrawerHandle>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders DrawerHandle with default props', () => {
    const wrapper = shallow(
      <DrawerHandle drawerTitle="Title">
        <div>Content</div>
      </DrawerHandle>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
