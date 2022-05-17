import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import { Menu } from 'antd';

import ActionsDropdownOrAction from '../ActionsDropdownOrAction';
import ExternalLink from '../ExternalLink';

describe('ActionsDropdownOrAction', () => {
  it('renders with multiple values', () => {
    const urls = fromJS(['dude.com/1', 'dude.com/2']);
    const wrapper = shallow(
      <ActionsDropdownOrAction
        values={urls}
        renderAction={(url, title) => (
          <ExternalLink href={url}>{title}</ExternalLink>
        )}
        renderDropdownAction={url => (
          <Menu.Item key={url}>
            <ExternalLink href={url}>{url}</ExternalLink>
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
          <ExternalLink href={url}>{title}</ExternalLink>
        )}
        renderDropdownAction={url => (
          <Menu.Item key={url}>
            <ExternalLink href={url}>{url}</ExternalLink>
          </Menu.Item>
        )}
        title="Dude URL"
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
