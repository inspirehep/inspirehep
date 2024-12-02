import React from 'react';
import { Tooltip } from 'antd';

import Icon from '@ant-design/icons';
import UserAction from '../../common/components/UserAction';
import LinkWithTargetBlank from '../../common/components/LinkWithTargetBlank';
import EventTracker from '../../common/components/EventTracker';
import { ReactComponent as mastodonLogo } from '../../common/assets/mastodon.svg';

const AuthorMastodonAction = ({ mastodon }: { mastodon: string }) => {
  const [user, host] = mastodon ? mastodon.split('@') : [];
  const href = `//${host}/@${user}`;
  return (
    <UserAction>
      <EventTracker
        eventCategory="Author detail"
        eventAction="Link"
        eventId="Mastodon"
      >
        <LinkWithTargetBlank href={href}>
          <Tooltip title="Mastodon">
            <Icon component={mastodonLogo} />
          </Tooltip>
        </LinkWithTargetBlank>
      </EventTracker>
    </UserAction>
  );
};

export default AuthorMastodonAction;
