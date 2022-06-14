import React from 'react';
import { Modal } from 'antd';

import OrcidPushSettingContainer from '../containers/OrcidPushSettingContainer';

type Props = {
    onCancel: $TSFixMeFunction;
    visible: boolean;
};

function UserSettingsModal({ onCancel, visible }: Props) {
  return (
    <Modal title="Settings" visible={visible} footer={null} onCancel={onCancel}>
      <OrcidPushSettingContainer />
    </Modal>
  );
}

export default UserSettingsModal;
