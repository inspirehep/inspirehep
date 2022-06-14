import React, { useCallback } from 'react';
import { FileDoneOutlined } from '@ant-design/icons';
import { Button, Menu } from 'antd';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { useParams } from 'react-router-dom';

import DropdownMenu from '../../common/components/DropdownMenu';
import IconText from '../../common/components/IconText';
import ListItemAction from '../../common/components/ListItemAction';

type Props = {
    onAssignWithoutUnclaimed: $TSFixMeFunction;
    onAssignWithoutClaimed: $TSFixMeFunction;
    onAssignUserCanNotClaim: $TSFixMeFunction;
    claimingUnclaimedPapersDisabled?: boolean;
    claimingClaimedPapersDisabled?: boolean;
    userCanNotClaimProfile?: boolean;
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'currentUserId' does not exist on type 'P... Remove this comment to see the full error message
function AssignOneDifferentProfileAction({ onAssignWithoutUnclaimed, onAssignWithoutClaimed, onAssignUserCanNotClaim, currentUserId, claimingUnclaimedPapersDisabled, claimingClaimedPapersDisabled, userCanNotClaimProfile, }: Props) {
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
      userCanNotClaimProfile,
    });
  }, [
    currentAuthorId,
    currentUserId,
    userCanNotClaimProfile,
    onAssignWithoutUnclaimed,
  ]);

  const onAssignUserCantClaim = useCallback(() => {
    onAssignUserCanNotClaim({
      from: currentAuthorId,
      to: currentUserId,
    });
  }, [currentAuthorId, currentUserId, onAssignUserCanNotClaim]);

  const onSelfAssign = () => {
    const onlyCanNotClaim =
      userCanNotClaimProfile && claimingClaimedPapersDisabled;
    const onlyClaimUnclaimed =
      !claimingUnclaimedPapersDisabled &&
      !userCanNotClaimProfile &&
      claimingClaimedPapersDisabled;
    const onlyClaimClaimedAndMaybeNotMatchingName = !claimingClaimedPapersDisabled;

    if (onlyCanNotClaim) {
      onAssignUserCantClaim();
    }
    if (onlyClaimUnclaimed) {
      onAssignUnclaimed();
    }
    if (onlyClaimClaimedAndMaybeNotMatchingName) {
      onAssignClaimed();
    }
  };

  return (
    <ListItemAction>
      <DropdownMenu
        title={
          <Button>
            <IconText text="claim" icon={<FileDoneOutlined />} />
          </Button>
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

export default AssignOneDifferentProfileAction;
