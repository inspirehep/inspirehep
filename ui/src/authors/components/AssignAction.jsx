import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { FileDoneOutlined } from '@ant-design/icons';
import { Button, Menu } from 'antd';
import { useParams } from 'react-router-dom';

import DropdownMenu from '../../common/components/DropdownMenu';
import IconText from '../../common/components/IconText';
import ListItemAction from '../../common/components/ListItemAction';

function AssignAction({ onAssignToAnotherAuthor, onAssign }) {
  const currentAuthorId = Number(useParams().id);
  const onSelfAssign = useCallback(
    () => {
      onAssign({ from: currentAuthorId, to: currentAuthorId });
    },
    [currentAuthorId, onAssign]
  );

  const onUnassign = useCallback(
    () => {
      onAssign({ from: currentAuthorId });
    },
    [currentAuthorId, onAssign]
  );

  const onAssignToAnother = useCallback(
    () => {
      onAssignToAnotherAuthor();
    },
    [onAssignToAnotherAuthor]
  );
  return (
    // TODO: rename `ListItemAction` because it's not only used for list item actions, such as (assign all and cite all)
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
          This is my paper
        </Menu.Item>
        <Menu.Item data-test-id="unassign" key="unassign" onClick={onUnassign}>
          This is not my paper
        </Menu.Item>
        <Menu.Item
          data-test-id="assign-another"
          key="assign-another"
          onClick={onAssignToAnother}
        >
          Assign to another author
        </Menu.Item>
      </DropdownMenu>
    </ListItemAction>
  );
}

AssignAction.propTypes = {
  onAssignToAnotherAuthor: PropTypes.func.isRequired,
  onAssign: PropTypes.func.isRequired,
};

export default AssignAction;
