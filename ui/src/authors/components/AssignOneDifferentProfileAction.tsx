import React, { useCallback } from 'react';
import { FileDoneOutlined } from '@ant-design/icons';
import { Button } from 'antd';
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

  const menuItems = [
    {
      key: '1',
      label: (
        <EventTracker
          eventCategory="Author detail"
          eventAction="Claim"
          eventId="Move to my profile"
        >
          <span
            data-test-id="assign-self"
            data-testid="assign-self"
            key="assign-self"
            onClick={onSelfAssign}
          >
            Move to my profile
          </span>
        </EventTracker>
      ),
    },
  ];

  return (
    <UserAction>
      <DropdownMenu
        title={
          <Button data-test-id="btn-claim" data-testid="btn-claim">
            <IconText text="claim" icon={<FileDoneOutlined />} />
          </Button>
        }
        items={menuItems}
      />
    </UserAction>
  );
}

export default AssignOneDifferentProfileAction;
