import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import { Menu } from 'antd';

import ActionsDropdownOrAction from '../ActionsDropdownOrAction';
import LinkWithTargetBlank from '../LinkWithTargetBlank';

describe('ActionsDropdownOrAction', () => {
  it('renders with multiple values', () => {
    const urls = fromJS(['dude.com/1', 'dude.com/2']);
    const wrapper = shallow(
      <ActionsDropdownOrAction
        values={urls}
        renderAction={(url, title) => (
          <LinkWithTargetBlank href={url}>{title}</LinkWithTargetBlank>
        )}
        renderDropdownAction={(url) => (
          <Menu.Item key={url}>
            <LinkWithTargetBlank href={url}>{url}</LinkWithTargetBlank>
          </Menu.Item>
        )}
        title="Dude URL"
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with single value', () => {
    const urls = fromJS(['dude.com/1']);
    const wrapper = shallow(
      <ActionsDropdownOrAction
        values={urls}
        renderAction={(url, title) => (
          <LinkWithTargetBlank href={url}>{title}</LinkWithTargetBlank>
        )}
        renderDropdownAction={(url) => (
          <Menu.Item key={url}>
            <LinkWithTargetBlank href={url}>{url}</LinkWithTargetBlank>
          </Menu.Item>
        )}
        title="Dude URL"
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
