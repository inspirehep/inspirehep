import React from 'react';
import { Button } from 'antd';
import { WorkflowDecisions } from '../../../common/constants';
import { WorkflowActions } from '../../constants';
import '../../common/components/ActionButtons.less';

export const LiteratureHepSelectionButtons = ({
  hasInspireCategories,
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
    isResolving && actionDecision === WorkflowDecisions.HEP_ACCEPT_CORE;
  const isAcceptLoading =
    isResolving && actionDecision === WorkflowDecisions.HEP_ACCEPT;
  const isRejectLoading =
    isResolving && actionDecision === WorkflowDecisions.HEP_REJECT;
  const containerClass = isBatch
    ? 'flex items-center flex-wrap'
    : 'flex flex-column items-center';
  const coreClass = isBatch
    ? 'font-white bg-completed mr2'
    : 'font-white bg-completed w-75 mb2';
  const acceptClass = isBatch
    ? 'font-white bg-halted mr2'
    : 'font-white bg-halted w-75 mb2';
  const rejectClass = isBatch
    ? 'font-white bg-error'
    : 'font-white bg-error w-75';

  return (
    <div className={containerClass}>
      {hasInspireCategories ? (
        <>
          <Button
            className={coreClass}
            onClick={() =>
              handleResolveAction(WorkflowDecisions.HEP_ACCEPT_CORE)
            }
            loading={isCoreLoading}
            disabled={isResolving && !isCoreLoading}
          >
            Core
          </Button>
          <Button
            className={acceptClass}
            onClick={() => handleResolveAction(WorkflowDecisions.HEP_ACCEPT)}
            loading={isAcceptLoading}
            disabled={isResolving && !isAcceptLoading}
          >
            Accept
          </Button>
        </>
      ) : (
        <p>Subject field is required</p>
      )}
      <Button
        className={rejectClass}
        onClick={() => handleResolveAction(WorkflowDecisions.HEP_REJECT)}
        loading={isRejectLoading}
        disabled={isResolving && !isRejectLoading}
      >
        Reject
      </Button>
    </div>
  );
};
