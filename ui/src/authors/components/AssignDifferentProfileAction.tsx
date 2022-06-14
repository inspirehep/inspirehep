import React, { useCallback } from 'react';
import { FileDoneOutlined } from '@ant-design/icons';
import { Button, Menu, Tooltip } from 'antd';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { useParams } from 'react-router-dom';

import DropdownMenu from '../../common/components/DropdownMenu';
import IconText from '../../common/components/IconText';
import ListItemAction from '../../common/components/ListItemAction';

type Props = {
    onAssignWithoutUnclaimed: $TSFixMeFunction;
    onAssignWithoutClaimed: $TSFixMeFunction;
    disabled?: boolean;
    claimingUnclaimedPapersDisabled?: boolean;
    claimingClaimedPapersDisabled?: boolean;
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'currentUserId' does not exist on type 'P... Remove this comment to see the full error message
function AssignDifferentProfileAction({ onAssignWithoutUnclaimed, onAssignWithoutClaimed, disabled, currentUserId, claimingUnclaimedPapersDisabled, claimingClaimedPapersDisabled, }: Props) {
  const currentAuthorId = Number(useParams().id);
  const onAssignUnclaimed = useCallback(() => {
    onAssignWithoutClaimed({
      from: currentAuthorId,
      to: currentUserId,
    });
  }, [currentAuthorId, currentUserId, onAssignWithoutClaimed]);
  const onAssignClaimed = useCallback(() => {
    onAssignWithoutUnclaimed({
      from: currentAuthorId,
      to: currentUserId,
    });
  }, [currentAuthorId, currentUserId, onAssignWithoutUnclaimed]);

  const onSelfAssign = () => {
    if (!claimingUnclaimedPapersDisabled) {
      onAssignUnclaimed();
    }
    if (!claimingClaimedPapersDisabled) {
      onAssignClaimed();
    }
  };

  return (
    // TODO: rename `ListItemAction` because it's not only used for list item actions, such as (assign all and cite all)
    <ListItemAction>
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
        <Menu.Item
          data-test-id="assign-self"
          key="assign-self"
          onClick={onSelfAssign}
        >
          Move to my profile
        </Menu.Item>
      </DropdownMenu>
    </ListItemAction>
  );
}

export default AssignDifferentProfileAction;
