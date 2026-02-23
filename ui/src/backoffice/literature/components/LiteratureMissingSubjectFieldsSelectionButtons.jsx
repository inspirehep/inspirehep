import React from 'react';
import { Button } from 'antd';
import { WorkflowDecisions } from '../../../common/constants';
import '../../common/components/ActionButtons.less';

export const LiteratureMissingSubjectFieldsSelectionButtons = ({
  handleResolveAction,
  isBatch = false,
}) => {
  const containerClass = isBatch
    ? 'flex items-center flex-wrap'
    : 'flex flex-column items-center';
  const rejectClass = isBatch
    ? 'font-white bg-error'
    : 'font-white bg-error w-75';

  return (
    <div className={containerClass}>
      <Button
        className={rejectClass}
        onClick={() => handleResolveAction(WorkflowDecisions.HEP_REJECT)}
      >
        Reject
      </Button>
    </div>
  );
};
