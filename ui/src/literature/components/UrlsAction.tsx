import React, { useCallback } from 'react';
import { List, Map } from 'immutable';
import { Menu } from 'antd';
import { LinkOutlined } from '@ant-design/icons';

import { Link } from 'react-router-dom';
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
  urls: List<string>; // TODO: Fix this type. This is wrong, we should read a List of Map objects, not a List of strings
  text: string;
  icon: JSX.Element;
  trackerEventId: string;
  page: string;
  eventAction?: string;
  isTargetBlank?: boolean;
}

function UrlsAction({
  urls,
  text,
  icon,
  trackerEventId,
  page,
  eventAction,
  isTargetBlank = true,
}: UrlsActionProps) {
  const renderUrlsAction = useCallback(
    (url, title) => {
      const value = url.get('value');
      return (
        <EventTracker
          eventCategory={page}
          eventAction={eventAction || 'Link'}
          eventId={trackerEventId}
        >
          {isTargetBlank ? (
            <LinkWithTargetBlank href={value}>{title}</LinkWithTargetBlank>
          ) : (
            <Link to={value}>{title}</Link>
          )}
        </EventTracker>
      );
    },
    [trackerEventId, page, eventAction, isTargetBlank]
  );

  const renderUrlsDropdownAction = useCallback(
    (url) => {
      const [href, display] = linkToHrefDisplayPair(url);
      return {
        key: display,
        label: (
          <span key={href}>
            <EventTracker
              eventCategory={page}
              eventAction={eventAction || 'Link'}
              eventId={trackerEventId}
            >
              {isTargetBlank ? (
                <LinkWithTargetBlank href={href}>{display}</LinkWithTargetBlank>
              ) : (
                <Link to={href}>{display}</Link>
              )}
            </EventTracker>
          </span>
        ),
      };
    },
    [trackerEventId, page, eventAction, isTargetBlank]
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
