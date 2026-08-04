import { XOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

import UserAction from '../../common/components/UserAction';
import LinkWithTargetBlank from '../../common/components/LinkWithTargetBlank';
import EventTracker from '../../common/components/EventTracker';

const AuthorTwitterAction = ({ twitter }: { twitter: string }) => {
  const href = `//x.com/${twitter}`;
  return (
    <UserAction>
      <EventTracker
        eventCategory="Author detail"
        eventAction="Link"
        eventId="Twitter"
      >
        <LinkWithTargetBlank href={href}>
          <Tooltip title="X / Twitter">
            <XOutlined />
          </Tooltip>
        </LinkWithTargetBlank>
      </EventTracker>
    </UserAction>
  );
};

export default AuthorTwitterAction;
