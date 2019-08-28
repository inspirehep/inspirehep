import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { getFromObjectOrImmutableMap } from '../utils';
import { ErrorPropType } from '../propTypes';
import ErrorAlert from './ErrorAlert';

class ErrorAlertOrChildren extends Component {
  render() {
    const { error, children } = this.props;
    if (error) {
      return (
        <ErrorAlert message={getFromObjectOrImmutableMap(error, 'message')} />
      );
    }
    return children;
  }
}

ErrorAlertOrChildren.propTypes = {
  error: ErrorPropType,
  children: PropTypes.node,
};

export default ErrorAlertOrChildren;
