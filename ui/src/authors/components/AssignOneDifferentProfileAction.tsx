import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { FileDoneOutlined } from '@ant-design/icons';
import { Button, Menu } from 'antd';
import { useParams } from 'react-router-dom';

import DropdownMenu from '../../common/components/DropdownMenu';
import IconText from '../../common/components/IconText';
import ListItemAction from '../../common/components/ListItemAction';

function AssignOneDifferentProfileAction({
  onAssignWithoutUnclaimed,
  onAssignWithoutClaimed,
  onAssignUserCanNotClaim,
  currentUserId,
  claimingUnclaimedPapersDisabled,
  claimingClaimedPapersDisabled,
  userCanNotClaimProfile,
}) {
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

AssignOneDifferentProfileAction.propTypes = {
  onAssignWithoutUnclaimed: PropTypes.func.isRequired,
  onAssignWithoutClaimed: PropTypes.func.isRequired,
  onAssignUserCanNotClaim: PropTypes.func.isRequired,
  claimingUnclaimedPapersDisabled: PropTypes.bool,
  claimingClaimedPapersDisabled: PropTypes.bool,
  userCanNotClaimProfile: PropTypes.bool,
};

export default AssignOneDifferentProfileAction;
