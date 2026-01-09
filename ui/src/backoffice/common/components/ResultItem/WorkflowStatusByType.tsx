import React from 'react';
import { getWorkflowStatusInfo } from '../../../utils/utils';

const WorkflowStatusByType = ({
  status,
  type,
}: {
  status: string;
  type: string;
}) => {
  const statusInfo = getWorkflowStatusInfo(status);
  if (!statusInfo) {
    return null;
  }

  return (
    <div>
      <p className={`b ${status.toLowerCase()} mt3`}>
        {statusInfo.icon} {statusInfo.text}
      </p>
      <br />
      <small>{statusInfo.description}</small>
    </div>
  );
};

export default WorkflowStatusByType;
