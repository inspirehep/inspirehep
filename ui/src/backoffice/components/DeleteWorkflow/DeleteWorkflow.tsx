import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { Action, ActionCreator } from 'redux';

import './DeleteWorkflow.less';
import { deleteWorkflow } from '../../../actions/backoffice';

const DeleteWorkflow: React.FC<{
  dispatch: ActionCreator<Action>;
  id: string;
}> = ({ dispatch, id }) => {
  const [open, setOpen] = useState(false);

  const showModal = () => {
    setOpen(true);
  };

  const hideModal = () => {
    setOpen(false);
  };

  return (
    <>
      <Button className="font-white bg-error" onClick={showModal}>
        Delete
      </Button>
      <Modal
        title="Modal"
        open={open}
        onOk={() => {
          dispatch(deleteWorkflow(id));
          hideModal();
        }}
        onCancel={hideModal}
        okText="Confirm"
        cancelText="Cancel"
        className="delete-modal"
      >
        <p>
          Are you sure you want to delete workflow? This operation is
          unreversable.
        </p>
      </Modal>
    </>
  );
};

export default DeleteWorkflow;
