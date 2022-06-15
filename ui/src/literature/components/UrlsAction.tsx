import React, { useCallback } from 'react';
import { List } from 'immutable';
import PropTypes from 'prop-types';
import { Menu } from 'antd';
import { LinkOutlined } from '@ant-design/icons';

import IconText from '../../common/components/IconText';
import ExternalLink from '../../common/components/ExternalLink';
import { removeProtocolAndWwwFromUrl } from '../../common/utils';
import ActionsDropdownOrAction from '../../common/components/ActionsDropdownOrAction';
import EventTracker from '../../common/components/EventTracker';

function linkToHrefDisplayPair(link: any) {
  const href = link.get('value');
  const description = link.get('description');
  const display = description || removeProtocolAndWwwFromUrl(href);
  return [href, display];
}

function UrlsAction({
  urls,
  text,
  icon,
  trackerEventId
}: any) {
  const renderUrlsAction = useCallback(
    (url, title) => (
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; eventId: any; }' is not... Remove this comment to see the full error message
      <EventTracker eventId={trackerEventId}>
        <ExternalLink href={url.get('value')}>{title}</ExternalLink>
      </EventTracker>
    ),
    [trackerEventId]
  );

  const eventTrackerProps = {
    eventId: trackerEventId
  }

  const renderUrlsDropdownAction = useCallback(
    url => {
      const [href, display] = linkToHrefDisplayPair(url);
      return (
        <Menu.Item key={href}>
          <EventTracker {...eventTrackerProps}>
            <ExternalLink href={href}>{display}</ExternalLink>
          </EventTracker>
        </Menu.Item>
      );
    },
    [trackerEventId]
  );

  // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
  const ACTION_TITLE = <IconText icon={icon} text={text} />;

  return (
    <ActionsDropdownOrAction
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      values={urls}
      renderAction={renderUrlsAction}
      renderDropdownAction={renderUrlsDropdownAction}
      title={ACTION_TITLE}
    />
  );
}

UrlsAction.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  urls: PropTypes.instanceOf(List).isRequired,
  text: PropTypes.string,
  icon: PropTypes.node,
  trackerEventId: PropTypes.string,
};

UrlsAction.defaultProps = {
  text: 'website',
  icon: <LinkOutlined />,
};

export default UrlsAction;
