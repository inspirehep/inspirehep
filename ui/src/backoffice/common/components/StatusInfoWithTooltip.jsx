import React from 'react';
import { Tooltip } from 'antd';
import { getWorkflowStatusInfo } from '../../utils/utils';

const StatusInfoWithTooltip = ({ status, placement = 'topLeft' }) => {
  const statusInfo = status ? getWorkflowStatusInfo(status) : null;

  if (!statusInfo) {
    return null;
  }

  return (
    <Tooltip title={statusInfo.description} placement={placement}>
      <p className={`b ${status.toLowerCase() || ''}`.trim()}>
        {statusInfo.icon} {statusInfo.text}
      </p>
    </Tooltip>
  );
};

export default StatusInfoWithTooltip;
