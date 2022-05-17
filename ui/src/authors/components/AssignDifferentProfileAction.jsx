import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { FileDoneOutlined } from '@ant-design/icons';
import { Button, Menu, Tooltip } from 'antd';
import { useParams } from 'react-router-dom';

import DropdownMenu from '../../common/components/DropdownMenu';
import IconText from '../../common/components/IconText';
import ListItemAction from '../../common/components/ListItemAction';

function AssignDifferentProfileAction({ disabled, currentUserId, onAssign }) {
  const currentAuthorId = Number(useParams().id);
  const onSelfAssign = useCallback(() => {
    onAssign({ from: currentAuthorId, to: currentUserId });
  }, [currentAuthorId, currentUserId, onAssign]);

  return (
    <ListItemAction>
      <DropdownMenu
        disabled={disabled}
        title={(
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
)}
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
  onAssign: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default AssignDifferentProfileAction;
