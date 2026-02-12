import React from 'react';
import { Button } from 'antd';
import { WorkflowDecisions } from '../../../common/constants';
import '../../common/components/ActionButtons.less';

export const LiteratureCoreSelectionButtons = ({
  handleResolveAction,
  isBatch = false,
}) => {
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
      >
        Core
      </Button>
      <Button
        className={acceptClass}
        onClick={() =>
          handleResolveAction(WorkflowDecisions.CORE_SELECTION_ACCEPT)
        }
      >
        Accept
      </Button>
    </div>
  );
};
