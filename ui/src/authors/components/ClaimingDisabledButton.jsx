import React from 'react';
import { FileDoneOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';

import DropdownMenu from '../../common/components/DropdownMenu';
import IconText from '../../common/components/IconText';
import ListItemAction from '../../common/components/ListItemAction';

const ClaimingDisabledButton = () => <ListItemAction>
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
</ListItemAction>;

export default ClaimingDisabledButton;
