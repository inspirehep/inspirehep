import React, { useCallback } from 'react';
import { List } from 'immutable';
import PropTypes from 'prop-types';
import { Menu } from 'antd';
import { LinkOutlined } from '@ant-design/icons';

import IconText from '../../common/components/IconText';
import ExternalLink from '../../common/components/ExternalLink.tsx';
import { removeProtocolAndWwwFromUrl } from '../../common/utils';
import ActionsDropdownOrAction from '../../common/components/ActionsDropdownOrAction';
import EventTracker from '../../common/components/EventTracker';

function linkToHrefDisplayPair(link) {
  const href = link.get('value');
  const description = link.get('description');
  const display = description || removeProtocolAndWwwFromUrl(href);
  return [href, display];
}

function UrlsAction({ urls, text, icon, trackerEventId }) {
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

UrlsAction.propTypes = {
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
