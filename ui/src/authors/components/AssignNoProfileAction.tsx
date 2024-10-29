import React from 'react';
import { FileDoneOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';

import DropdownMenu from '../../common/components/DropdownMenu';
import IconText from '../../common/components/IconText';
import UserAction from '../../common/components/UserAction';

export const CLAIMING_DISABLED_INFO = (
  <p>
    There is no profile associated to your account.{' '}
    <a
      href="https://help.inspirehep.net/knowledge-base/corrections-2/#authors"
      target="_blank"
    >
      Learn more
    </a>
  </p>
);

function AssignNoProfileAction() {
  return (
    <UserAction>
      <DropdownMenu
        disabled
        title={
          <Tooltip title={CLAIMING_DISABLED_INFO}>
            <Button disabled data-test-id="btn-claiming-profile">
              <IconText text="claim" icon={<FileDoneOutlined />} />
            </Button>
          </Tooltip>
        }
      />
    </UserAction>
  );
}

export default AssignNoProfileAction;
