import React from 'react';
import { TwitterOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

import UserAction from '../../common/components/UserAction';
import LinkWithTargetBlank from '../../common/components/LinkWithTargetBlank';
import EventTracker from '../../common/components/EventTracker';

const AuthorTwitterAction = ({ twitter }: { twitter: string }) => {
  const href = `//twitter.com/${twitter}`;
  return (
    <UserAction>
      <Tooltip title="Twitter">
        <EventTracker
          eventCategory="Author detail"
          eventAction="Link"
          eventId="Twitter"
        >
          <LinkWithTargetBlank href={href}>
            <TwitterOutlined />
          </LinkWithTargetBlank>
        </EventTracker>
      </Tooltip>
    </UserAction>
  );
};

export default AuthorTwitterAction;
