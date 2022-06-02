import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { FileDoneOutlined } from '@ant-design/icons';
import { Button, Menu, Tooltip } from 'antd';
import { useParams } from 'react-router-dom';

import DropdownMenu from '../../common/components/DropdownMenu';
import IconText from '../../common/components/IconText';
import ListItemAction from '../../common/components/ListItemAction';

function AssignOwnProfileAction({
  onAssign,
  disabled,
  disabledAssignAction,
  numberOfSelected,
  claimingTooltip,
}) {
  const currentAuthorId = Number(useParams().id);
  const onSelfAssign = useCallback(() => {
    onAssign({
      from: currentAuthorId,
      to: currentAuthorId,
      isUnassignAction: false,
    });
  }, [currentAuthorId, onAssign]);

  const onUnassign = useCallback(() => {
    onAssign({ from: currentAuthorId, isUnassignAction: true });
  }, [currentAuthorId, onAssign]);

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
          disabled={disabledAssignAction}
        >
          <Tooltip
            title={
              disabledAssignAction
                ? claimingTooltip
                : null
            }
          >
            <p>
              {numberOfSelected === 1
                ? 'This is my paper'
                : 'These are my papers'}
            </p>
          </Tooltip>
        </Menu.Item>
        <Menu.Item data-test-id="unassign" key="unassign" onClick={onUnassign}>
          {numberOfSelected === 1
            ? 'This is not my paper'
            : 'These are not my papers'}
        </Menu.Item>
      </DropdownMenu>
    </ListItemAction>
  );
}

AssignOwnProfileAction.propTypes = {
  onAssign: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  disabledAssignAction: PropTypes.bool,
  numberOfSelected: PropTypes.number,
  claimingTooltip: PropTypes.string,
};

AssignOwnProfileAction.defaultProps = {
  claimingTooltip: 'This paper is already claimed',
  numberOfSelected: 1,
};

export default AssignOwnProfileAction;
