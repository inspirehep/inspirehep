import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { LinkOutlined } from '@ant-design/icons';
import { Menu, Tooltip } from 'antd';

import ExternalLink from '../../common/components/ExternalLink';
import { removeProtocolAndWwwFromUrl } from '../../common/utils';
import ActionsDropdownOrAction from '../../common/components/ActionsDropdownOrAction';

function isBlog(website) {
  return website.get('description', '').toLowerCase() === 'blog';
}

function websiteToHrefDisplayPair(website) {
  const href = website.get('value');
  const display = isBlog(website) ? 'Blog' : removeProtocolAndWwwFromUrl(href);
  return [href, display];
}

function sortBlogFirst(a, b) {
  if (a === b) {
    return 0;
  }

  if (isBlog(a)) {
    return -1;
  }

  if (isBlog(b)) {
    return 1;
  }

  return 0;
}

function renderWebsitesDropdownAction(website) {
  const [href, display] = websiteToHrefDisplayPair(website);
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
  <Tooltip title="Personal website">
    <LinkOutlined />
  </Tooltip>
);

function AuthorWebsitesAction({ websites }) {
  const sortedWebsites = useMemo(() => websites.sort(sortBlogFirst), [
    websites,
  ]);
  return (
    <ActionsDropdownOrAction
      values={sortedWebsites}
      renderAction={renderWebsiteAction}
      renderDropdownAction={renderWebsitesDropdownAction}
      title={ACTION_TITLE}
    />
  );
}

AuthorWebsitesAction.propTypes = {
  websites: PropTypes.instanceOf(List).isRequired,
};

export default AuthorWebsitesAction;
