import React, { useCallback } from 'react';
import { List } from 'immutable';
import { Menu } from 'antd';
import { LinkOutlined } from '@ant-design/icons';

import IconText from '../../common/components/IconText';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from '../../common/components/ExternalLink.tsx';
import { removeProtocolAndWwwFromUrl } from '../../common/utils';
import ActionsDropdownOrAction from '../../common/components/ActionsDropdownOrAction';
import EventTracker from '../../common/components/EventTracker';

function linkToHrefDisplayPair(link: $TSFixMe) {
  const href = link.get('value');
  const description = link.get('description');
  const display = description || removeProtocolAndWwwFromUrl(href);
  return [href, display];
}

type OwnProps = {
    urls: $TSFixMe; // TODO: PropTypes.instanceOf(List)
    text?: string;
    icon?: React.ReactNode;
    trackerEventId?: string;
};

// @ts-expect-error ts-migrate(2565) FIXME: Property 'defaultProps' is used before being assig... Remove this comment to see the full error message
type Props = OwnProps & typeof UrlsAction.defaultProps;

function UrlsAction({ urls, text, icon, trackerEventId }: Props) {
  const renderUrlsAction = useCallback(
    (url, title) => (
      // @ts-expect-error ts-migrate(2745) FIXME: This JSX tag's 'children' prop expects type 'never... Remove this comment to see the full error message
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
          {/* @ts-expect-error ts-migrate(2745) FIXME: This JSX tag's 'children' prop expects type 'never... Remove this comment to see the full error message */}
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

UrlsAction.defaultProps = {
  text: 'website',
  icon: <LinkOutlined />,
};

export default UrlsAction;
