import React from 'react';
import { Button, Tooltip } from 'antd';
import { WorkflowDecisions } from '../../../common/constants';

const LiteratureRejectButton = ({
  handleResolveAction,
  isWeak = false,
  tooltipText,
  isBatch = false,
}) => {
  const rejectClass = [
    isWeak ? 'bg-error-weak' : 'font-white bg-error',
    isBatch ? null : 'w-75',
  ]
    .filter(Boolean)
    .join(' ');

  const button = (
    <Button
      className={rejectClass}
      onClick={() => handleResolveAction(WorkflowDecisions.HEP_REJECT)}
    >
      Reject
    </Button>
  );

  if (tooltipText) {
    return <Tooltip title={tooltipText}>{button}</Tooltip>;
  }

  return button;
};

export default LiteratureRejectButton;
