import React, { useCallback } from 'react';
import { FileDoneOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { useParams } from 'react-router-dom';

import DropdownMenu from '../../common/components/DropdownMenu';
import IconText from '../../common/components/IconText';
import UserAction from '../../common/components/UserAction';
import EventTracker from '../../common/components/EventTracker';

function AssignAction({
  onAssignToAnotherAuthor,
  onAssign,
  onUnassign,
  disabled,
  numberOfSelected,
}: {
  onAssignToAnotherAuthor: Function;
  onAssign: Function;
  onUnassign: Function;
  disabled: boolean;
  numberOfSelected: number;
}) {
  const currentAuthorId = Number(useParams<{ id: string }>().id);
  const onSelfAssign = useCallback(() => {
    onAssign({ from: currentAuthorId, to: currentAuthorId });
  }, [currentAuthorId, onAssign]);

  const onSelfUnassign = useCallback(() => {
    onUnassign({ from: currentAuthorId });
  }, [currentAuthorId, onUnassign]);

  const onAssignToAnother = useCallback(() => {
    onAssignToAnotherAuthor();
  }, [onAssignToAnotherAuthor]);

  const menuItems = [
    {
      key: '1',
      label: (
        <EventTracker
          eventCategory="Author detail"
          eventAction="Claim"
          eventId="This is my paper"
        >
          <span
            data-test-id="assign-self"
            data-testid="assign-self"
            key="assign-self"
            onClick={onSelfAssign}
          >
            {numberOfSelected === 1
              ? 'This is my paper'
              : 'These are my papers'}
          </span>
        </EventTracker>
      ),
    },
    {
      key: '2',
      label: (
        <EventTracker
          eventCategory="Author detail"
          eventAction="Claim"
          eventId="This is not my paper"
        >
          <span
            data-test-id="unassign"
            data-testid="unassign"
            key="unassign"
            onClick={onSelfUnassign}
          >
            {numberOfSelected === 1
              ? 'This is not my paper'
              : 'These are not my papers'}
          </span>
        </EventTracker>
      ),
    },
    {
      key: '3',
      label: (
        <EventTracker
          eventCategory="Author detail"
          eventAction="Claim"
          eventId="Assign to another author"
        >
          <span
            data-test-id="assign-another"
            data-testid="assign-another"
            key="assign-another"
            onClick={onAssignToAnother}
          >
            Assign to another author
          </span>
        </EventTracker>
      ),
    },
  ];

  return (
    <UserAction>
      <DropdownMenu
        disabled={disabled}
        items={menuItems}
        title={
          <Tooltip
            title={
              disabled
                ? 'Please select the papers you want to claim or remove from the profile.'
                : null
            }
          >
            <Button data-test-id="btn-claim">
              <IconText text="claim" icon={<FileDoneOutlined />} />
            </Button>
          </Tooltip>
        }
      />
    </UserAction>
  );
}

AssignAction.defaultProps = {
  numberOfSelected: 1,
};

export default AssignAction;
