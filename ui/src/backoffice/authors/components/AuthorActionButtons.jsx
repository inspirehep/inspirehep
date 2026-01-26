import React from 'react';
import { Button } from 'antd';
import { WorkflowDecisions } from '../../../common/constants';
import { WorkflowActions } from '../../constants';
import '../../common/components/ActionButtons.less';

export const AuthorActionButtons = ({
  handleResolveAction,
  actionInProgress,
  workflowId,
}) => {
  const actionId = actionInProgress?.get?.('id');
  const actionType = actionInProgress?.get?.('type');
  const actionDecision = actionInProgress?.get?.('decision');
  const isResolving =
    actionType === WorkflowActions.RESOLVE && actionId === workflowId;
  const isAcceptLoading =
    isResolving && actionDecision === WorkflowDecisions.ACCEPT;
  const isAcceptCurateLoading =
    isResolving && actionDecision === WorkflowDecisions.ACCEPT_CURATE;
  const isRejectLoading =
    isResolving && actionDecision === WorkflowDecisions.REJECT;
  return (
    <div className="w-100 flex flex-column items-center">
      <Button
        className="font-white bg-completed w-75 mb2"
        onClick={() => handleResolveAction(WorkflowDecisions.ACCEPT)}
        loading={isAcceptLoading}
        disabled={isResolving && !isAcceptLoading}
      >
        Accept
      </Button>
      <Button
        className="font-white bg-halted w-75 mb2"
        onClick={() => handleResolveAction(WorkflowDecisions.ACCEPT_CURATE)}
        loading={isAcceptCurateLoading}
        disabled={isResolving && !isAcceptCurateLoading}
      >
        Accept + Curation
      </Button>
      <Button
        className="font-white bg-error w-75"
        onClick={() => handleResolveAction(WorkflowDecisions.REJECT)}
        loading={isRejectLoading}
        disabled={isResolving && !isRejectLoading}
      >
        Reject
      </Button>
    </div>
  );
};
