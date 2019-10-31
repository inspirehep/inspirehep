import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { Menu, Icon, Tooltip } from 'antd';

import ExternalLink from '../../common/components/ExternalLink';
import { removeProtocolAndWwwFromUrl } from '../../common/utils';
import ActionsDropdownOrAction from '../../common/components/ActionsDropdownOrAction';

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

const ACTION_TITLE = (
  <Tooltip title="Conference website">
    <Icon type="link" />
  </Tooltip>
);

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
