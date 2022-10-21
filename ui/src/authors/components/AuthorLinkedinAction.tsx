import React from 'react';
import { LinkedinOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

import UserAction from '../../common/components/UserAction';
import LinkWithTargetBlank from '../../common/components/LinkWithTargetBlank';

const AuthorLinkedinAction = ({ linkedin }: { linkedin: string }) => {
  const href = `//linkedin.com/in/${linkedin}`;
  return (
    <UserAction>
      <Tooltip title="LinkedIn">
        <LinkWithTargetBlank href={href}>
          <LinkedinOutlined />
        </LinkWithTargetBlank>
      </Tooltip>
    </UserAction>
  );
};

export default AuthorLinkedinAction;
