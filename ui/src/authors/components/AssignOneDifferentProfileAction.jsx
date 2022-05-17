import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { FileDoneOutlined } from '@ant-design/icons';
import { Button, Menu } from 'antd';
import { useParams } from 'react-router-dom';

import DropdownMenu from '../../common/components/DropdownMenu';
import IconText from '../../common/components/IconText';
import ListItemAction from '../../common/components/ListItemAction';

function AssignOneDifferentProfileAction({ currentUserId, onAssign }) {
  const currentAuthorId = Number(useParams().id);
  const onSelfAssign = useCallback(() => {
    onAssign({ from: currentAuthorId, to: currentUserId });
  }, [onAssign, currentAuthorId, currentUserId]);

  return (
    <ListItemAction>
      <DropdownMenu
        title={(
          <Button>
            <IconText text="claim" icon={<FileDoneOutlined />} />
          </Button>
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

AssignOneDifferentProfileAction.propTypes = {
  onAssign: PropTypes.func.isRequired,
};

export default AssignOneDifferentProfileAction;
