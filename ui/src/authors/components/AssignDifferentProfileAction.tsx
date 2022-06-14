import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { FileDoneOutlined } from '@ant-design/icons';
import { Button, Menu, Tooltip } from 'antd';
import { useParams } from 'react-router-dom';

import DropdownMenu from '../../common/components/DropdownMenu';
import IconText from '../../common/components/IconText';
import ListItemAction from '../../common/components/ListItemAction';

function AssignDifferentProfileAction({
  onAssignWithoutUnclaimed,
  onAssignWithoutClaimed,
  disabled,
  currentUserId,
  claimingUnclaimedPapersDisabled,
  claimingClaimedPapersDisabled,
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

AssignDifferentProfileAction.propTypes = {
  onAssignWithoutUnclaimed: PropTypes.func.isRequired,
  onAssignWithoutClaimed: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  claimingUnclaimedPapersDisabled: PropTypes.bool,
  claimingClaimedPapersDisabled: PropTypes.bool,
};

export default AssignDifferentProfileAction;
