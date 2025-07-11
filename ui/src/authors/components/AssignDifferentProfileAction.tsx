import React, { useCallback } from 'react';
import { FileDoneOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { useParams } from 'react-router-dom';

import DropdownMenu from '../../common/components/DropdownMenu';
import IconText from '../../common/components/IconText';
import UserAction from '../../common/components/UserAction';

function AssignDifferentProfileAction({
  disabled,
  currentUserId,
  onAssign,
}: {
  disabled: boolean;
  currentUserId: number;
  onAssign: Function;
}) {
  const currentAuthorId = Number(useParams<{ id: string }>().id);
  const onSelfAssign = useCallback(() => {
    onAssign({ from: currentAuthorId, to: currentUserId });
  }, [currentAuthorId, currentUserId, onAssign]);

  const menuItems = [
    {
      key: '1',
      label: (
        <span
          data-test-id="assign-self"
          data-testid="assign-self"
          key="assign-self"
          onClick={onSelfAssign}
        >
          Move to my profile
        </span>
      ),
    },
  ];

  return (
    <UserAction>
      <DropdownMenu
        disabled={disabled}
        title={
          <Tooltip
            title={
              disabled
                ? 'Please select the papers you want to claim or remove from the profile.'
                : null
            }
          >
            <Button data-test-id="claim-multiple" data-testid="claim-multiple">
              <IconText text="claim" icon={<FileDoneOutlined />} />
            </Button>
          </Tooltip>
        }
        items={menuItems}
      />
    </UserAction>
  );
}

export default AssignDifferentProfileAction;
