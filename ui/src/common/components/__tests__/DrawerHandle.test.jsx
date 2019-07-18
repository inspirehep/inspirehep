import React from 'react';
import { shallow } from 'enzyme';
import { Drawer } from 'antd';

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

  it('makes drawer visible on handle click', () => {
    const wrapper = shallow(
      <DrawerHandle drawerTitle="Title">
        <div>Content</div>
      </DrawerHandle>
    );

    wrapper.find('[data-test-id="handle-button"]').simulate('click');
    wrapper.update();
    expect(wrapper.find(Drawer).prop('visible')).toBe(true);
  });
});
