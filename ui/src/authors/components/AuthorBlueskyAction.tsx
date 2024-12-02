import React from 'react';
import { Tooltip } from 'antd';

import Icon from '@ant-design/icons';
import UserAction from '../../common/components/UserAction';
import LinkWithTargetBlank from '../../common/components/LinkWithTargetBlank';
import EventTracker from '../../common/components/EventTracker';
import { ReactComponent as blueskyLogo } from '../../common/assets/bluesky.svg';

const AuthorBlueskyAction = ({ bluesky }: { bluesky: string }) => {
  const href = `//bsky.app/profile/${bluesky}`;
  return (
    <UserAction>
      <EventTracker
        eventCategory="Author detail"
        eventAction="Link"
        eventId="Bluesky"
      >
        <LinkWithTargetBlank href={href}>
          <Tooltip title="Bluesky">
            <Icon component={blueskyLogo} style={{ color: 'rgb(95,95,95)' }} />
          </Tooltip>
        </LinkWithTargetBlank>
      </EventTracker>
    </UserAction>
  );
};

export default AuthorBlueskyAction;
