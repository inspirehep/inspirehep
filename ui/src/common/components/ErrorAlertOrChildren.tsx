import React, { Component } from 'react';

import { getFromObjectOrImmutableMap } from '../utils';
import { ErrorPropType } from '../propTypes';
import ErrorAlert from './ErrorAlert';

type Props = {
    // @ts-expect-error ts-migrate(2749) FIXME: 'ErrorPropType' refers to a value, but is being us... Remove this comment to see the full error message
    error?: ErrorPropType;
};

class ErrorAlertOrChildren extends Component<Props> {

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

export default ErrorAlertOrChildren;
