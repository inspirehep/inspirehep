import { Component } from 'react';
import PropTypes from 'prop-types';
import * as Sentry from '@sentry/browser';

class ErrorBoundary extends Component {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }

  componentDidCatch(error: any, errorInfo: any) {
    this.setState({ error });
    Sentry.withScope(scope => {
      Object.keys(errorInfo).forEach(key => {
        scope.setExtra(key, errorInfo[key]);
      });
      Sentry.captureException(error);
    });
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'renderError' does not exist on type 'Rea... Remove this comment to see the full error message
    const { children, renderError } = this.props;
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type 'Readonly<... Remove this comment to see the full error message
    const { error } = this.state;
    if (error) {
      return renderError(error);
    }
    return children;
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  renderError: PropTypes.func.isRequired,
};

export default ErrorBoundary;
