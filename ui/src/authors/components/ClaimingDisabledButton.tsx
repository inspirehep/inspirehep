import { FileDoneOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';

import DropdownMenu from '../../common/components/DropdownMenu';
import IconText from '../../common/components/IconText';
import UserAction from '../../common/components/UserAction';

const ClaimingDisabledButton = () => (
  <UserAction>
    <DropdownMenu
      disabled
      title={
        <span>
          <Tooltip title="Login to claim your papers">
            <Button disabled data-testid="btn-claiming-login">
              <IconText text="claim" icon={<FileDoneOutlined />} />
            </Button>
          </Tooltip>
        </span>
      }
    />
  </UserAction>
);

export default ClaimingDisabledButton;
