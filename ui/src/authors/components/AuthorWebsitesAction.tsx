import React, { useMemo } from 'react';
import { List, Map } from 'immutable';
import { LinkOutlined } from '@ant-design/icons';
import { Menu, Tooltip } from 'antd';

import LinkWithTargetBlank from '../../common/components/LinkWithTargetBlank';
import { removeProtocolAndWwwFromUrl } from '../../common/utils';
import ActionsDropdownOrAction from '../../common/components/ActionsDropdownOrAction';
import EventTracker from '../../common/components/EventTracker';

function isBlog(website: Map<string, any>): boolean {
  return website.get('description', '').toLowerCase() === 'blog';
}

function websiteToHrefDisplayPair(website: Map<string, any>) {
  const href = website.get('value');
  const display = isBlog(website) ? 'Blog' : removeProtocolAndWwwFromUrl(href);
  return [href, display];
}

function sortBlogFirst(a: string, b: string): number {
  if (a === b) {
    return 0;
  }

  if (isBlog(a as never as Map<string, any>)) {
    return -1;
  }

  if (isBlog(b as never as Map<string, any>)) {
    return 1;
  }

  return 0;
}

function renderWebsitesDropdownAction(website: Map<string, any>) {
  const [href, display] = websiteToHrefDisplayPair(website);
  
  return (
    <Menu.Item key={href}>
      <EventTracker
        eventCategory="Author detail"
        eventAction="Link"
        eventId="Author websites"
      >
        <LinkWithTargetBlank href={href}>{display}</LinkWithTargetBlank>
      </EventTracker>
    </Menu.Item>
  );
}
const ACTION_TITLE = (
  <Tooltip title="Author websites">
    <LinkOutlined />
  </Tooltip>
);

function renderWebsiteAction(website: Map<string, any>) {
  return (
    <EventTracker
      eventCategory="Author detail"
      eventAction="Link"
      eventId="Author website"
    >
      <LinkWithTargetBlank href={website.get('value')}>
        {ACTION_TITLE}
      </LinkWithTargetBlank>
    </EventTracker>
  );
}

function AuthorWebsitesAction({ websites }: { websites: List<string> }) {
  const sortedWebsites = useMemo(
    () => websites.sort(sortBlogFirst),
    [websites]
  );
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
