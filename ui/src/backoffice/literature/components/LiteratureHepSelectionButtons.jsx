import React from 'react';
import { Button } from 'antd';
import { WorkflowDecisions } from '../../../common/constants';

export const LiteratureHepSelectionButtons = ({
  hasInspireCategories,
  handleResolveAction,
  actionInProgress,
}) => {
  const isResolving = actionInProgress === 'resolve';

  return (
    <div className="flex flex-column items-center">
      {hasInspireCategories ? (
        <>
          <Button
            className="font-white bg-completed w-75 mb2"
            onClick={() =>
              handleResolveAction(WorkflowDecisions.HEP_ACCEPT_CORE)
            }
            loading={isResolving}
          >
            Core
          </Button>
          <Button
            className="font-white bg-halted w-75 mb2"
            onClick={() => handleResolveAction(WorkflowDecisions.HEP_ACCEPT)}
            loading={isResolving}
          >
            Accept
          </Button>
        </>
      ) : (
        <p>Subject field is required</p>
      )}
      <Button
        className="font-white bg-error w-75"
        onClick={() => handleResolveAction(WorkflowDecisions.HEP_REJECT)}
        loading={isResolving}
      >
        Reject
      </Button>
    </div>
  );
};
