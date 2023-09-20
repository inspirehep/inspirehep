import React from 'react';
import { Alert } from 'antd';

import GoBackLinkContainer from '../containers/GoBackLinkContainer';

const ErrorAlert = ({ message }: { message: string }) => {
  return (
    <Alert
      type="warning"
      showIcon
      message={message}
      description={
        <span>
          Please try again later or <GoBackLinkContainer />
        </span>
      }
    />
  );
};

ErrorAlert.defaultProps = {
  message: 'Something went wrong',
};

export default ErrorAlert;
