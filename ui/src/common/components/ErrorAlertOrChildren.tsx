import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { getFromObjectOrImmutableMap } from '../utils';
import { ErrorPropType } from '../propTypes';
import ErrorAlert from './ErrorAlert';

class ErrorAlertOrChildren extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type 'Readonly<... Remove this comment to see the full error message
    const { error, children } = this.props;
    if (error) {
      return (
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        <ErrorAlert message={getFromObjectOrImmutableMap(error, 'message')} />
      );
    }
    return children;
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ErrorAlertOrChildren.propTypes = {
  error: ErrorPropType,
  children: PropTypes.node,
};

export default ErrorAlertOrChildren;
