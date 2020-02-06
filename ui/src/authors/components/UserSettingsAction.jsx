import React, { useCallback, useState } from 'react';
import { Button } from 'antd';

import ListItemAction from '../../common/components/ListItemAction';
import IconText from '../../common/components/IconText';
import UserSettingsModal from './UserSettingsModal';

function UserSettingsAction() {
  const [isSettingsModalVisible, setSettingsModalVisible] = useState(false);

  const onClick = useCallback(() => {
    setSettingsModalVisible(true);
  }, []);
  const onSettingsModalCancel = useCallback(() => {
    setSettingsModalVisible(false);
  }, []);
  return (
    <>
      <ListItemAction>
        <Button onClick={onClick}>
          <IconText text="settings" type="setting" />
        </Button>
      </ListItemAction>
      <UserSettingsModal
        visible={isSettingsModalVisible}
        onCancel={onSettingsModalCancel}
      />
    </>
  );
}

export default UserSettingsAction;
