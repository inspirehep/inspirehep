import React, { useCallback, useState } from 'react';
import { Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

import UserAction from '../../common/components/UserAction';
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
      <UserAction>
        <Button onClick={onClick}>
          <IconText text="settings" icon={<SettingOutlined />} />
        </Button>
      </UserAction>
      <UserSettingsModal
        visible={isSettingsModalVisible}
        onCancel={onSettingsModalCancel}
      />
    </>
  );
}

export default UserSettingsAction;
