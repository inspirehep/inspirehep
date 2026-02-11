import React from 'react';
import { Button } from 'antd';
import { WorkflowDecisions } from '../../../common/constants';
import { WorkflowActions } from '../../constants';
import '../../common/components/ActionButtons.less';

export const LiteratureCoreSelectionButtons = ({
  handleResolveAction,
  actionInProgress,
  workflowId,
  isBatch = false,
}) => {
  const actionId = actionInProgress?.get?.('id');
  const actionType = actionInProgress?.get?.('type');
  const actionDecision = actionInProgress?.get?.('decision');
  const isResolving =
    actionType === WorkflowActions.RESOLVE && actionId === workflowId;
  const isCoreLoading =
    isResolving &&
    actionDecision === WorkflowDecisions.CORE_SELECTION_ACCEPT_CORE;
  const isAcceptLoading =
    isResolving && actionDecision === WorkflowDecisions.CORE_SELECTION_ACCEPT;
  const containerClass = isBatch
    ? 'flex items-center'
    : 'flex flex-column items-center';
  const coreClass = isBatch
    ? 'font-white bg-completed mr2'
    : 'font-white bg-completed w-75 mb2';
  const acceptClass = isBatch
    ? 'font-white bg-halted'
    : 'font-white bg-halted w-75 mb2';

  return (
    <div className={containerClass}>
      <Button
        className={coreClass}
        onClick={() =>
          handleResolveAction(WorkflowDecisions.CORE_SELECTION_ACCEPT_CORE)
        }
        loading={isCoreLoading}
        disabled={isResolving && !isCoreLoading}
      >
        Core
      </Button>
      <Button
        className={acceptClass}
        onClick={() =>
          handleResolveAction(WorkflowDecisions.CORE_SELECTION_ACCEPT)
        }
        loading={isAcceptLoading}
        disabled={isResolving && !isAcceptLoading}
      >
        Accept
      </Button>
    </div>
  );
};
