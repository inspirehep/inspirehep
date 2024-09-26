import React, { useCallback } from 'react';
import { List, Map } from 'immutable';
import { Menu } from 'antd';
import { LinkOutlined } from '@ant-design/icons';

import IconText from '../../common/components/IconText';
import LinkWithTargetBlank from '../../common/components/LinkWithTargetBlank';
import { removeProtocolAndWwwFromUrl } from '../../common/utils';
import ActionsDropdownOrAction from '../../common/components/ActionsDropdownOrAction';
import EventTracker from '../../common/components/EventTracker';

function linkToHrefDisplayPair(link: Map<string, string>) {
  const href = link.get('value') as unknown as string;
  const description = link.get('description');
  const display = description || removeProtocolAndWwwFromUrl(href);
  return [href, display];
}

interface UrlsActionProps {
  urls: List<string>;
  text: string;
  icon: JSX.Element;
  trackerEventId: string;
  page: string;
  eventAction?: string;
}

function UrlsAction({
  urls,
  text,
  icon,
  trackerEventId,
  page,
  eventAction,
}: UrlsActionProps) {
  const renderUrlsAction = useCallback(
    (url, title) => (
      <EventTracker
        eventCategory={page}
        eventAction={eventAction || 'Link'}
        eventId={trackerEventId}
      >
        <LinkWithTargetBlank href={url.get('value')}>
          {title}
        </LinkWithTargetBlank>
      </EventTracker>
    ),
    [trackerEventId, page, eventAction]
  );

  const renderUrlsDropdownAction = useCallback(
    (url) => {
      const [href, display] = linkToHrefDisplayPair(url);
      return {
        key: display,
        label: <span key={href}>
          <EventTracker
            eventCategory={page}
            eventAction={eventAction || 'Link'}
            eventId={trackerEventId}
          >
            <LinkWithTargetBlank href={href}>{display}</LinkWithTargetBlank>
          </EventTracker>
        </span>
      };
    },
    [trackerEventId, page, eventAction]
  );

  const ACTION_TITLE = <IconText icon={icon} text={text} />;

  return (
    <ActionsDropdownOrAction
      values={urls}
      renderAction={renderUrlsAction}
      renderDropdownAction={renderUrlsDropdownAction}
      title={ACTION_TITLE}
    />
  );
}

UrlsAction.defaultProps = {
  text: 'website',
  icon: <LinkOutlined />,
};

export default UrlsAction;
