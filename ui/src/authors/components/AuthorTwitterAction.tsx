import React from 'react';
import { TwitterOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

import UserAction from '../../common/components/UserAction';
import LinkWithTargetBlank from '../../common/components/LinkWithTargetBlank';

const AuthorTwitterAction = ({ twitter }: { twitter: string }) => {
  const href = `//twitter.com/${twitter}`;
  return (
    <UserAction>
      <Tooltip title="Twitter">
        <LinkWithTargetBlank href={href}>
          <TwitterOutlined />
        </LinkWithTargetBlank>
      </Tooltip>
    </UserAction>
  );
};

export default AuthorTwitterAction;
