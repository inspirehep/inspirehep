import React from 'react';
import { shallow } from 'enzyme';
import { Menu } from 'antd';
import DropdownMenu from '../../../common/components/DropdownMenu';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('DropdownMenu', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders', () => {
    const wrapper = shallow(
      <DropdownMenu title="title">
        <Menu.Item key="1">
          <li key="1">test</li>
        </Menu.Item>
        <Menu.Item key="2">
          <li key="2">test2</li>
        </Menu.Item>
      </DropdownMenu>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with all props set', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
      <DropdownMenu disabled onClick={jest.fn()} title="title">
        <Menu.Item key="1">
          <li key="1">test</li>
        </Menu.Item>
        <Menu.Item key="2">
          <li key="2">test2</li>
        </Menu.Item>
      </DropdownMenu>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
