import React from 'react';
import { Modal } from 'antd';
import PropTypes from 'prop-types';

import OrcidPushSettingContainer from '../containers/OrcidPushSettingContainer';

function UserSettingsModal({ onCancel, visible }) {
  return (
    <Modal title="Settings" visible={visible} footer={null} onCancel={onCancel}>
      <OrcidPushSettingContainer />
    </Modal>
  );
}

UserSettingsModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
};

export default UserSettingsModal;
