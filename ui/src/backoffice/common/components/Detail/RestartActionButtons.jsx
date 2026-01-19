import React from 'react';
import { Button } from 'antd';
import { EditOutlined, RedoOutlined, SyncOutlined } from '@ant-design/icons';

export const RestartActionButtons = ({
  actionInProgress,
  handleRestart,
  handleRestartCurrent,
  id,
  pidType,
}) => (
  <div className="flex flex-column items-center">
    <Button
      className="mb2 w-75"
      onClick={handleRestart}
      loading={actionInProgress === 'restart'}
    >
      <SyncOutlined />
      Restart workflow
    </Button>
    <Button
      className="mb2 w-75"
      onClick={handleRestartCurrent}
      loading={actionInProgress === 'restart'}
    >
      <RedoOutlined />
      Restart current step
    </Button>
    <Button className="mb2 w-75" type="primary">
      <a href={`/editor/backoffice/${pidType}/${id}`}>
        <EditOutlined />
        {'  '}
        Open in Editor
      </a>
    </Button>
  </div>
);
