import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import { Menu } from 'antd';

import ActionsDropdownOrAction from '../ActionsDropdownOrAction';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from '../ExternalLink.tsx';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ActionsDropdownOrAction', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
