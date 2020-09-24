import React from 'react';
import { Alert } from 'antd';

const WARNING_MESSAGE = (
  <span>
    <strong>Disclaimer: </strong> Please note that the list of seminars is
    managed by users and INSPIRE makes no claims as to its completeness and
    accuracy.
  </span>
);

function SeminarCountWarning() {
  return <Alert message={WARNING_MESSAGE} type="warning" showIcon />;
}

export default SeminarCountWarning;
