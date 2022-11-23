import React, { useCallback } from 'react';
import { FileDoneOutlined } from '@ant-design/icons';
import { Button, Menu } from 'antd';
import { useParams } from 'react-router-dom';

import DropdownMenu from '../../common/components/DropdownMenu';
import IconText from '../../common/components/IconText';
import UserAction from '../../common/components/UserAction';
import EventTracker from '../../common/components/EventTracker';

function AssignOneDifferentProfileAction({
  currentUserId,
  onAssign,
}: {
  currentUserId: number;
  onAssign: Function;
}) {
  const currentAuthorId = Number(useParams<{ id: string }>().id);
  const onSelfAssign = useCallback(() => {
    onAssign({ from: currentAuthorId, to: currentUserId });
  }, [onAssign, currentAuthorId, currentUserId]);

  return (
    <UserAction>
      <DropdownMenu
        title={
          <Button>
            <IconText text="claim" icon={<FileDoneOutlined />} />
          </Button>
        }
      >
        <EventTracker
          eventCategory="Author detail"
          eventAction="Claim"
          eventId="Move to my profile"
        >
          <Menu.Item
            data-test-id="assign-self"
            key="assign-self"
            onClick={onSelfAssign}
          >
            Move to my profile
          </Menu.Item>
        </EventTracker>
      </DropdownMenu>
    </UserAction>
  );
}

export default AssignOneDifferentProfileAction;
