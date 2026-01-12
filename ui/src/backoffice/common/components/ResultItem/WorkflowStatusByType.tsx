import React from 'react';
import { getWorkflowStatusInfo } from '../../../utils/utils';
import LiteratureActionButtons from '../../../literature/components/LiteratureActionButtons';
import { LITERATURE_PID_TYPE } from '../../../../common/constants';

const WorkflowStatusByType = ({
  status,
  type,
  hasInspireCategories,
  handleResolveAction,
  actionInProgress,
}: {
  status: string;
  type: string;
  hasInspireCategories?: boolean;
  handleResolveAction?: (action: string, value: string) => void;
  actionInProgress?: string | false;
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
      {type === LITERATURE_PID_TYPE && (
        <LiteratureActionButtons
          status={status}
          hasInspireCategories={hasInspireCategories}
          handleResolveAction={handleResolveAction}
          actionInProgress={actionInProgress}
        />
      )}
      <br />
      <small>{statusInfo.description}</small>
    </div>
  );
};

export default WorkflowStatusByType;
