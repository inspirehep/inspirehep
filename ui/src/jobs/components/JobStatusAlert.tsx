import React from 'react';
import { Alert } from 'antd';

const ALERT_TYPES_BY_STATUS = { pending: 'warning', closed: 'error' };

type Props = {
    status?: string;
};

function JobStatusAlert({ status }: Props) {
  // @ts-expect-error ts-migrate(2538) FIXME: Type 'undefined' cannot be used as an index type.
  const shouldDisplayAlert = ALERT_TYPES_BY_STATUS[status] != null;

  return (
    shouldDisplayAlert && (
      <div className="mb2">
        <Alert
          // @ts-expect-error ts-migrate(2538) FIXME: Type 'undefined' cannot be used as an index type.
          type={ALERT_TYPES_BY_STATUS[status]}
          message={<span>This job is {status}!</span>}
          showIcon={false}
        />
      </div>
    )
  );
}

export default JobStatusAlert;
