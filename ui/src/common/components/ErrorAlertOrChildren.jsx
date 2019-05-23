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
  error: ErrorPropType, // eslint-disable-line react/require-default-props
  children: PropTypes.node, // eslint-disable-line react/require-default-props
};

export default ErrorAlertOrChildren;
