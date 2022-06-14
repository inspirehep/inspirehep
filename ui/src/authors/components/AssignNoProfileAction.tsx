import React from 'react';
import { FileDoneOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';

import DropdownMenu from '../../common/components/DropdownMenu';
import IconText from '../../common/components/IconText';
import ListItemAction from '../../common/components/ListItemAction';

export const CLAIMING_DISABLED_INFO = (
  <p>
    There is no profile associated to your account. Please contact us at{' '}
    <a href="mailto:authors@inspirehep.net">authors@inspirehep.net</a>
  </p>
);

function AssignNoProfileAction() {
  return (
    // TODO: rename `ListItemAction` because it's not only used for list item actions, such as (assign all and cite all)
    <ListItemAction>
      <DropdownMenu
        disabled
        title={
          <Tooltip title={CLAIMING_DISABLED_INFO}>
            <Button disabled>
              <IconText text="claim" icon={<FileDoneOutlined />} />
            </Button>
          </Tooltip>
        }
      />
    </ListItemAction>
  );
}

export default AssignNoProfileAction;
