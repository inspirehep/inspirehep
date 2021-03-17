import React from 'react';
import PropTypes from 'prop-types';
import { ToolOutlined } from '@ant-design/icons';
import { Button, Menu } from 'antd';

import DropdownMenu from '../../common/components/DropdownMenu';
import IconText from '../../common/components/IconText';
import ListItemAction from '../../common/components/ListItemAction';
import { MAX_ASSIGN_RECORDS_TO_CONFERENCE } from '../constants';

function ToolAction({ onAssignToConference, disabledAssignConference }) {
  return (
    <ListItemAction>
      <DropdownMenu
        title={
          <Button>
            <IconText text="tools" icon={<ToolOutlined />} />
          </Button>
        }
      >
        <Menu.Item
          title={
            disabledAssignConference
              ? `Please select up to ${MAX_ASSIGN_RECORDS_TO_CONFERENCE} papers that you want to assign to a conference.`
              : null
          }
          disabled={disabledAssignConference}
          data-test-id="assign-conference"
          key="assign-conference"
          onClick={() => onAssignToConference()}
        >
          Assign conference
        </Menu.Item>
      </DropdownMenu>
    </ListItemAction>
  );
}

ToolAction.propTypes = {
  onAssignToConference: PropTypes.func.isRequired,
  disabledAssignConference: PropTypes.bool,
};

export default ToolAction;
