import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'antd';

import GoBackLinkContainer from '../containers/GoBackLinkContainer';

class ErrorAlert extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'message' does not exist on type 'Readonl... Remove this comment to see the full error message
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

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ErrorAlert.propTypes = {
  message: PropTypes.string,
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
ErrorAlert.defaultProps = {
  message: 'Something went wrong',
};

export default ErrorAlert;
