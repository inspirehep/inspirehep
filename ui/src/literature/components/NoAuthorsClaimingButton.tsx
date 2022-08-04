import React from 'react';
import { FileDoneOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';

import DropdownMenu from '../../common/components/DropdownMenu';
import IconText from '../../common/components/IconText';
import ListItemAction from '../../common/components/ListItemAction';

const NoAuthorsClaimingButton = () => <ListItemAction>
  <DropdownMenu
    disabled
    title={
      <Tooltip title='This paper has no authors.'>
        <Button disabled>
          <IconText text="claim" icon={<FileDoneOutlined />} />
        </Button>
      </Tooltip>
    }
  />
</ListItemAction>;

export default NoAuthorsClaimingButton;
