import React from 'react';
import { shallow } from 'enzyme';
import { Drawer } from 'antd';

// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import DrawerHandle from '../DrawerHandle.tsx';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('DrawerHandle', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders DrawerHandle with default props', () => {
    const wrapper = shallow(
      <DrawerHandle drawerTitle="Title">
        <div>Content</div>
      </DrawerHandle>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('makes drawer visible on handle click', () => {
    const wrapper = shallow(
      <DrawerHandle drawerTitle="Title">
        <div>Content</div>
      </DrawerHandle>
    );

    wrapper.find('[data-test-id="handle-button"]').simulate('click');
    wrapper.update();
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(Drawer).prop('visible')).toBe(true);
  });
});
