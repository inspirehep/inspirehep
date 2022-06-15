import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import { Menu } from 'antd';

import ActionsDropdownOrAction from '../ActionsDropdownOrAction';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from '../ExternalLink.tsx';


describe('ActionsDropdownOrAction', () => {
  
  it('renders with multiple values', () => {
    const urls = fromJS(['dude.com/1', 'dude.com/2']);
    const wrapper = shallow(
      <ActionsDropdownOrAction
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        values={urls}
        renderAction={(url: any, title: any) => (
          <ExternalLink href={url}>{title}</ExternalLink>
        )}
        renderDropdownAction={(url: any) => <Menu.Item key={url}>
          <ExternalLink href={url}>{url}</ExternalLink>
        </Menu.Item>}
        title="Dude URL"
      />
    );
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('renders with single value', () => {
    const urls = fromJS(['dude.com/1']);
    const wrapper = shallow(
      <ActionsDropdownOrAction
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        values={urls}
        renderAction={(url: any, title: any) => (
          <ExternalLink href={url}>{title}</ExternalLink>
        )}
        renderDropdownAction={(url: any) => <Menu.Item key={url}>
          <ExternalLink href={url}>{url}</ExternalLink>
        </Menu.Item>}
        title="Dude URL"
      />
    );
    
    expect(wrapper).toMatchSnapshot();
  });
});
