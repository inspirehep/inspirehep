import { FileDoneOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';

import DropdownMenu from '../../common/components/DropdownMenu';
import IconText from '../../common/components/IconText';
import UserAction from '../../common/components/UserAction';

const NoAuthorsClaimingButton = () => (
  <UserAction>
    <DropdownMenu
      disabled
      title={
        <span>
          <Tooltip title="This paper has no authors.">
            <Button disabled data-test-id="btn-claiming-authors">
              <IconText text="claim" icon={<FileDoneOutlined />} />
            </Button>
          </Tooltip>
        </span>
      }
    />
  </UserAction>
);

export default NoAuthorsClaimingButton;
