import { EditOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import React, { ReactNode } from 'react';
import IconText from './IconText';
import UserAction from './UserAction';

type DisabledEditRecordActionProps = {
  message: string | ReactNode;
};

export default function DisabledEditRecordAction({
  message,
}: DisabledEditRecordActionProps) {
  return (
    <UserAction>
      <Tooltip title={message}>
        <Button disabled>
          <IconText text="edit" icon={<EditOutlined />} />
        </Button>
      </Tooltip>
    </UserAction>
  );
}
