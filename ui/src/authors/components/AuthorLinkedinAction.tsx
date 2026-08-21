import { LinkedinOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

import UserAction from '../../common/components/UserAction';
import LinkWithTargetBlank from '../../common/components/LinkWithTargetBlank';
import EventTracker from '../../common/components/EventTracker';

const AuthorLinkedinAction = ({ linkedin }: { linkedin: string }) => {
  const href = `//linkedin.com/in/${linkedin}`;
  return (
    <UserAction>
      <EventTracker
        eventCategory="Author detail"
        eventAction="Link"
        eventId="Linkedin"
      >
        <LinkWithTargetBlank href={href}>
          <Tooltip title="LinkedIn">
            <LinkedinOutlined />
          </Tooltip>
        </LinkWithTargetBlank>
      </EventTracker>
    </UserAction>
  );
};

export default AuthorLinkedinAction;
