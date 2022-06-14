import React, { Component } from 'react';
import { Alert } from 'antd';

import GoBackLinkContainer from '../containers/GoBackLinkContainer';

type OwnProps = {
    message?: string;
};

type Props = OwnProps & typeof ErrorAlert.defaultProps;

class ErrorAlert extends Component<Props> {

static defaultProps = {
    message: 'Something went wrong',
};

  render() {
    const { message } = this.props;
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
  }
}

export default ErrorAlert;
