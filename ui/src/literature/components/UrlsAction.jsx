import React, { useCallback } from 'react';
import { List } from 'immutable';
import PropTypes from 'prop-types';
import { Menu } from 'antd';

import IconText from '../../common/components/IconText';
import ExternalLink from '../../common/components/ExternalLink';
import { removeProtocolAndWwwFromUrl } from '../../common/utils';
import ActionsDropdownOrAction from '../../common/components/ActionsDropdownOrAction';
import EventTracker from '../../common/components/EventTracker';

function linkToHrefDisplayPair(link) {
  const href = link.get('value');
  const description = link.get('description');
  const display = description || removeProtocolAndWwwFromUrl(href);
  return [href, display];
}

function UrlsAction({ urls, iconText, icon, trackerEventId }) {
  const renderUrlsAction = useCallback(
    (url, title) => (
      <EventTracker eventId={trackerEventId}>
        <ExternalLink href={url.get('value')}>{title}</ExternalLink>
      </EventTracker>
    ),
    [trackerEventId]
  );

  const renderUrlsDropdownAction = useCallback(
    url => {
      const [href, display] = linkToHrefDisplayPair(url);
      return (
        <Menu.Item key={href}>
          <EventTracker eventId={trackerEventId}>
            <ExternalLink href={href}>{display}</ExternalLink>
          </EventTracker>
        </Menu.Item>
      );
    },
    [trackerEventId]
  );

  const ACTION_TITLE = <IconText text={iconText} icon={icon} />;

  return (
    <ActionsDropdownOrAction
      values={urls}
      renderAction={renderUrlsAction}
      renderDropdownAction={renderUrlsDropdownAction}
      title={ACTION_TITLE}
    />
  );
}

UrlsAction.propTypes = {
  urls: PropTypes.instanceOf(List).isRequired,
  iconText: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  trackerEventId: PropTypes.string.isRequired,
};

export default UrlsAction;
