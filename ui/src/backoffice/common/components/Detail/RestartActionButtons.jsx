import React from 'react';
import { Button } from 'antd';
import { EditOutlined, RedoOutlined, SyncOutlined } from '@ant-design/icons';
import { WorkflowActions, WorkflowStatuses } from '../../../constants';

export const RestartActionButtons = ({
  restartActionInProgress,
  handleRestart,
  handleRestartCurrent,
  id,
  pidType,
  status,
}) => {
  const actionId = restartActionInProgress?.get?.('id');
  const actionType = restartActionInProgress?.get?.('type');
  const actionDecision = restartActionInProgress?.get?.('decision');

  const isRestarting =
    actionType === WorkflowActions.RESTART && actionId === id;
  const isRestartWorkflowLoading =
    isRestarting && actionDecision === WorkflowActions.RESTART;
  const isRestartCurrentLoading =
    isRestarting && actionDecision === WorkflowActions.RESTART_CURRENT;
  const isCompleted = status === WorkflowStatuses.COMPLETED;
  const isBlocked = status === WorkflowStatuses.BLOCKED;

  const isRestartWorkflowDisabled = isRestarting && !isRestartWorkflowLoading;
  const isRestartCurrentDisabled =
    isBlocked || (isRestarting && !isRestartCurrentLoading);

  if (isCompleted) {
    return <div>Workflow completed, no further actions available</div>;
  }

  return (
    <div className="flex flex-column items-center">
      <Button
        className="mb2 w-75"
        onClick={handleRestart}
        loading={isRestartWorkflowLoading}
        disabled={isRestartWorkflowDisabled}
      >
        <SyncOutlined />
        Restart workflow
      </Button>
      <Button
        className="mb2 w-75"
        onClick={handleRestartCurrent}
        loading={isRestartCurrentLoading}
        disabled={isRestartCurrentDisabled}
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
};
