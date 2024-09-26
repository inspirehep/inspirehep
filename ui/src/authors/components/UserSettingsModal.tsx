import React from 'react';
import { Modal } from 'antd';

import OrcidPushSettingContainer from '../containers/OrcidPushSettingContainer';

function UserSettingsModal({
  onCancel,
  visible,
}: {
  onCancel: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  visible: boolean;
}) {
  return (
    <Modal title="Settings" open={visible} footer={null} onCancel={onCancel}>
      <OrcidPushSettingContainer />
    </Modal>
  );
}

export default UserSettingsModal;
