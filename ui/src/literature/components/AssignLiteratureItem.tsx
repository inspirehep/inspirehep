import React, { useCallback } from 'react';
import { FileDoneOutlined } from '@ant-design/icons';
import { Button, Menu } from 'antd';

import DropdownMenu from '../../common/components/DropdownMenu';
import IconText from '../../common/components/IconText';
import UserAction from '../../common/components/UserAction';
import EventTracker from '../../common/components/EventTracker';

interface AssignLiteratureItemProps {
  onAssign(data: { to: number; literatureId: number }): void;
  controlNumber: number;
  currentUserRecordId: number;
  page: string;
}

const AssignLiteratureItem = (props: AssignLiteratureItemProps) => {
  const { onAssign, controlNumber, currentUserRecordId, page } = props;

  const onAssignLiteratureItem = useCallback(() => {
    onAssign({ to: currentUserRecordId, literatureId: controlNumber });
  }, [onAssign, controlNumber, currentUserRecordId]);

  const menuItems = [
    {
      key: '1',
      label: (
        <EventTracker      
          eventCategory={page}
          eventAction="Claim"
          eventId="Move to my profile"
        >
          <span
            data-test-id="assign-literature-item"
            data-testid="assign-literature-item"
            key="assign-literature-item"
            onClick={onAssignLiteratureItem}
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
          <Button data-test-id="btn-claiming-literature">
            <IconText text="claim" icon={<FileDoneOutlined />} />
          </Button>
        }
        items={menuItems}
      />
    </UserAction>
  );
};

export default AssignLiteratureItem;
