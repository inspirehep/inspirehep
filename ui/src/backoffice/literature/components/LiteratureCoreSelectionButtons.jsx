import React from 'react';
import { Button } from 'antd';
import { WorkflowDecisions } from '../../../common/constants';

export const LiteratureCoreSelectionButtons = ({
  handleResolveAction,
  actionInProgress,
}) => {
  const isLoading = actionInProgress === 'resolve';
  return (
    <div className="flex flex-column items-center">
      <Button
        className="font-white bg-completed w-75 mb2"
        onClick={() =>
          handleResolveAction(WorkflowDecisions.CORE_SELECTION_ACCEPT_CORE)
        }
        loading={isLoading}
      >
        Core
      </Button>
      <Button
        className="font-white bg-halted w-75 mb2"
        onClick={() =>
          handleResolveAction(WorkflowDecisions.CORE_SELECTION_ACCEPT)
        }
        loading={isLoading}
      >
        Accept
      </Button>
    </div>
  );
};
