import React from 'react';
import { Modal, Button } from 'antd';
import PropTypes from 'prop-types';
import pluralizeUnlessSingle from '../../common/utils';

function ExportToCdsModal({ visible, onCancel, onOk, selectionSize }) {
  return (
    <Modal
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="confirm" type="primary" onClick={onOk}>
          Confirm
        </Button>,
      ]}
    >
      <p>
        You have selected {selectionSize}{' '}
        {pluralizeUnlessSingle('paper', selectionSize)}.<br />
        Are you sure you want to export it to CDS?
      </p>
    </Modal>
  );
}

ExportToCdsModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  selectionSize: PropTypes.number.isRequired,
};

export default ExportToCdsModal;
