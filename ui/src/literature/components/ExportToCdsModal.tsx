import React from 'react';
import { Modal, Button } from 'antd';
import pluralizeUnlessSingle from '../../common/utils';

type Props = {
    onCancel: $TSFixMeFunction;
    onOk: $TSFixMeFunction;
    visible: boolean;
    selectionSize: number;
};

function ExportToCdsModal({ visible, onCancel, onOk, selectionSize }: Props) {
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

export default ExportToCdsModal;
