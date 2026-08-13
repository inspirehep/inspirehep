import { Button } from 'antd';
import { WorkflowDecisions } from '../../../common/constants';
import { WorkflowActions } from '../../constants';

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
    <div className="w-100 flex items-center flex-wrap" style={{ gap: '4px' }}>
      <Button
        color="cyan"
        variant="solid"
        onClick={() => handleResolveAction(WorkflowDecisions.ACCEPT)}
        loading={isAcceptLoading}
        disabled={isResolving && !isAcceptLoading}
      >
        Accept
      </Button>
      <Button
        color="orange"
        variant="solid"
        onClick={() => handleResolveAction(WorkflowDecisions.ACCEPT_CURATE)}
        loading={isAcceptCurateLoading}
        disabled={isResolving && !isAcceptCurateLoading}
      >
        Accept + Curation
      </Button>
      <Button
        color="danger"
        variant="solid"
        onClick={() => handleResolveAction(WorkflowDecisions.REJECT)}
        loading={isRejectLoading}
        disabled={isResolving && !isRejectLoading}
      >
        Reject
      </Button>
    </div>
  );
};
