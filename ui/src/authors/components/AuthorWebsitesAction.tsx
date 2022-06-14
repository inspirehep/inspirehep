import React, { useMemo } from 'react';
import { List } from 'immutable';
import { LinkOutlined } from '@ant-design/icons';
import { Menu, Tooltip } from 'antd';

// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from '../../common/components/ExternalLink.tsx';
import { removeProtocolAndWwwFromUrl } from '../../common/utils';
import ActionsDropdownOrAction from '../../common/components/ActionsDropdownOrAction';

function isBlog(website: $TSFixMe) {
  return website.get('description', '').toLowerCase() === 'blog';
}

function websiteToHrefDisplayPair(website: $TSFixMe) {
  const href = website.get('value');
  const display = isBlog(website) ? 'Blog' : removeProtocolAndWwwFromUrl(href);
  return [href, display];
}

function sortBlogFirst(a: $TSFixMe, b: $TSFixMe) {
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

function renderWebsitesDropdownAction(website: $TSFixMe) {
  const [href, display] = websiteToHrefDisplayPair(website);
  return (
    <Menu.Item key={href}>
      <ExternalLink href={href}>{display}</ExternalLink>
    </Menu.Item>
  );
}

function renderWebsiteAction(website: $TSFixMe, title: $TSFixMe) {
  return <ExternalLink href={website.get('value')}>{title}</ExternalLink>;
}

const ACTION_TITLE = (
  <Tooltip title="Author websites">
    <LinkOutlined />
  </Tooltip>
);

type Props = {
    websites: $TSFixMe; // TODO: PropTypes.instanceOf(List)
};

function AuthorWebsitesAction({ websites }: Props) {
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

export default AuthorWebsitesAction;
