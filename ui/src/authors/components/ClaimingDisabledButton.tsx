import React from 'react';
import { FileDoneOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';

import DropdownMenu from '../../common/components/DropdownMenu';
import IconText from '../../common/components/IconText';
import UserAction from '../../common/components/UserAction';

const ClaimingDisabledButton = () => <UserAction>
  <DropdownMenu
    disabled
    title={
      <Tooltip title='Login to claim your papers'>
        <Button disabled>
          <IconText text="claim" icon={<FileDoneOutlined />} />
        </Button>
      </Tooltip>
    }
  />
</UserAction>;

export default ClaimingDisabledButton;
