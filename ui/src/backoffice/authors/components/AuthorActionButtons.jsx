import React from 'react';
import { Button } from 'antd';
import { WorkflowDecisions } from '../../../common/constants';
import '../../common/components/ActionButtons.less';

export const AuthorActionButtons = ({
  handleResolveAction,
  actionInProgress,
}) => {
  const isLoading = actionInProgress === 'resolve';
  return (
    <div className="w-100 flex flex-column items-center">
      <Button
        className="font-white bg-completed w-75 mb2"
        onClick={() => handleResolveAction(WorkflowDecisions.ACCEPT)}
        loading={isLoading}
      >
        Accept
      </Button>
      <Button
        className="font-white bg-halted w-75 mb2"
        onClick={() => handleResolveAction(WorkflowDecisions.ACCEPT_CURATE)}
        loading={isLoading}
      >
        Accept + Curation
      </Button>
      <Button
        className="font-white bg-error w-75"
        onClick={() => handleResolveAction(WorkflowDecisions.REJECT)}
        loading={isLoading}
      >
        Reject
      </Button>
    </div>
  );
};
