import React from 'react';
import { FileDoneOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';

import DropdownMenu from '../../common/components/DropdownMenu';
import IconText from '../../common/components/IconText';
import ListItemAction from '../../common/components/ListItemAction';

const ClaimingDisabledButton = () => <ListItemAction>
  <DropdownMenu
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    disabled
    title={
      <Tooltip title='Login to claim your papers'>
        <Button disabled>
          {/* @ts-ignore */}
          <IconText text="claim" icon={<FileDoneOutlined />} />
        </Button>
      </Tooltip>
    }
  />
</ListItemAction>;

export default ClaimingDisabledButton;
