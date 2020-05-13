import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { Menu } from 'antd';
import { LinkOutlined } from '@ant-design/icons';

import ExternalLink from './ExternalLink';
import { removeProtocolAndWwwFromUrl } from '../utils';
import ActionsDropdownOrAction from './ActionsDropdownOrAction';
import IconText from './IconText';

function renderWebsitesDropdownAction(website) {
  const href = website.get('value');
  const display =
    website.get('description') || removeProtocolAndWwwFromUrl(href);
  return (
    <Menu.Item key={href}>
      <ExternalLink href={href}>{display}</ExternalLink>
    </Menu.Item>
  );
}

function renderWebsiteAction(website, title) {
  return <ExternalLink href={website.get('value')}>{title}</ExternalLink>;
}

function WebsitesAction({ websites, title }) {
  return (
    <ActionsDropdownOrAction
      values={websites}
      renderAction={renderWebsiteAction}
      renderDropdownAction={renderWebsitesDropdownAction}
      title={title}
    />
  );
}

WebsitesAction.propTypes = {
  websites: PropTypes.instanceOf(List).isRequired,
  title: PropTypes.node,
};

WebsitesAction.defaultProps = {
  title: <IconText icon={<LinkOutlined />} text="website" />,
};

export default WebsitesAction;
