import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { Menu } from 'antd';
import { LinkOutlined } from '@ant-design/icons';

import ExternalLink from '../../common/components/ExternalLink';
import { removeProtocolAndWwwFromUrl } from '../../common/utils';
import ActionsDropdownOrAction from '../../common/components/ActionsDropdownOrAction';
import IconText from '../../common/components/IconText';

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

const ACTION_TITLE = <IconText icon={<LinkOutlined />} text="website" />;

function ConferenceWebsitesAction({ websites }) {
  return (
    <ActionsDropdownOrAction
      values={websites}
      renderAction={renderWebsiteAction}
      renderDropdownAction={renderWebsitesDropdownAction}
      title={ACTION_TITLE}
    />
  );
}

ConferenceWebsitesAction.propTypes = {
  websites: PropTypes.instanceOf(List).isRequired,
};

export default ConferenceWebsitesAction;
