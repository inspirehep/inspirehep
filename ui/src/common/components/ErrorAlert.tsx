import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'antd';

import GoBackLinkContainer from '../containers/GoBackLinkContainer';

class ErrorAlert extends Component {
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

ErrorAlert.propTypes = {
  message: PropTypes.string,
};

ErrorAlert.defaultProps = {
  message: 'Something went wrong',
};

export default ErrorAlert;
