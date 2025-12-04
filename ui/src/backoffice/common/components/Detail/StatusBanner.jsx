import React from 'react';
import { Row, Col } from 'antd';
import { getWorkflowStatusInfo } from '../../../utils/utils';
import { WorkflowStatuses } from '../../../constants';

export const StatusBanner = ({ status }) => {
  if (!status) return null;

  const statusInfo = getWorkflowStatusInfo(status);

  const baseClasses = [
    `bg-${status}`,
    status === WorkflowStatuses.ERROR ? 'white' : '',
    'w-100',
  ]
    .filter(Boolean)
    .join(' ');

  const text = statusInfo?.text ?? 'Unknown Status';

  return (
    <Row className="mv3" justify="center" gutter={35}>
      <Col xs={24}>
        <div className={baseClasses}>
          <p className="b f3 tc pv2">{text}</p>
        </div>
      </Col>
    </Row>
  );
};
