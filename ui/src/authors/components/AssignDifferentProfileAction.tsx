import { useCallback } from 'react';
import { FileDoneOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { useParams } from 'react-router-dom';

import DropdownMenu from '../../common/components/DropdownMenu';
import IconText from '../../common/components/IconText';
import UserAction from '../../common/components/UserAction';

function AssignDifferentProfileAction({
  disabled,
  currentUserId,
  onAssign,
}: {
  disabled: boolean;
  currentUserId: number;
  onAssign: Function;
}) {
  const currentAuthorId = Number(useParams<{ id: string }>().id);
  const onSelfAssign = useCallback(() => {
    onAssign({ from: currentAuthorId, to: currentUserId });
  }, [currentAuthorId, currentUserId, onAssign]);

  const menuItems = [
    {
      key: '1',
      label: (
        <span
          data-testid="assign-self"
          key="assign-self"
          onClick={onSelfAssign}
        >
          Move to my profile
        </span>
      ),
    },
  ];

  return (
    <UserAction>
      <DropdownMenu
        disabled={disabled}
        title={
          <span>
            <Tooltip
              title={
                disabled
                  ? 'Please select the papers you want to claim or remove from the profile.'
                  : null
              }
            >
              <Button data-testid="claim-multiple" disabled={disabled}>
                <IconText text="claim" icon={<FileDoneOutlined />} />
              </Button>
            </Tooltip>
          </span>
        }
        items={menuItems}
      />
    </UserAction>
  );
}

export default AssignDifferentProfileAction;
