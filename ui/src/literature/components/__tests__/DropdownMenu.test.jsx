import React from 'react';
import { shallow } from 'enzyme';
import { Menu } from 'antd';
import DropdownMenu from '../../../common/components/DropdownMenu';

describe('DropdownMenu', () => {
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
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with all props set', () => {
    const wrapper = shallow(
      <DropdownMenu disabled onClick={jest.fn()} title="title">
        <Menu.Item key="1">
          <li key="1">test</li>
        </Menu.Item>
        <Menu.Item key="2">
          <li key="2">test2</li>
        </Menu.Item>
      </DropdownMenu>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
