import React from 'react';
import { Button } from 'antd';
import { WorkflowDecisions } from '../../../common/constants';
import '../../common/components/ActionButtons.less';

export const LiteratureHepSelectionButtons = ({
  hasInspireCategories,
  handleResolveAction,
  isBatch = false,
}) => {
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
          >
            Core
          </Button>
          <Button
            className={acceptClass}
            onClick={() => handleResolveAction(WorkflowDecisions.HEP_ACCEPT)}
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
      >
        Reject
      </Button>
    </div>
  );
};
