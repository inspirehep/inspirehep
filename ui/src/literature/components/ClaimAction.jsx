import React from 'react';
import { Tooltip } from 'antd';
import { FileExclamationTwoTone } from '@ant-design/icons';
import ListItemAction from '../../common/components/ListItemAction';

function ClaimAction() {
  return (
    <ListItemAction>
      <Tooltip title="Unclaimed paper. Click on the Claim button to claim or remove it from the profile.">
        <FileExclamationTwoTone />
      </Tooltip>
    </ListItemAction>
  );
}

ClaimAction.propTypes = {};

export default ClaimAction;
