import React, { useCallback } from 'react';
import { FileDoneOutlined } from '@ant-design/icons';
import { Button, Menu, Tooltip } from 'antd';
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
  onAssignToAnotherAuthor: Function,
  onAssign: Function,
  onUnassign: Function,
  disabled: boolean,
  numberOfSelected: number,
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
  return (
    // TODO: rename `UserAction` because it's not only used for list item actions, such as (assign all and cite all)
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
            <Button>
              <IconText text="claim" icon={<FileDoneOutlined />} />
            </Button>
          </Tooltip>
        }
      >
        <EventTracker
          eventCategory="Author detail"
          eventAction="Claim"
          eventId="This is my paper"
        >
        <Menu.Item
          data-test-id="assign-self"
          key="assign-self"
          onClick={onSelfAssign}
        >
          {numberOfSelected === 1 ? 'This is my paper' : 'These are my papers'}
        </Menu.Item>
        </EventTracker>
        <EventTracker
          eventCategory="Author detail"
          eventAction="Claim"
          eventId="This is not my paper"
        >
        <Menu.Item
          data-test-id="unassign"
          key="unassign"
          onClick={onSelfUnassign}
        >
          {numberOfSelected === 1
            ? 'This is not my paper'
            : 'These are not my papers'}
        </Menu.Item>
        </EventTracker>
        <EventTracker
          eventCategory="Author detail"
          eventAction="Claim"
          eventId="Assign to another author"
        >
        <Menu.Item
          data-test-id="assign-another"
          key="assign-another"
          onClick={onAssignToAnother}
        >
          Assign to another author
        </Menu.Item>
        </EventTracker>
      </DropdownMenu>
    </UserAction>
  );
}

AssignAction.defaultProps = {
  numberOfSelected: 1,
};

export default AssignAction;
