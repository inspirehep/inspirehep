import { Component } from 'react';
import * as Sentry from '@sentry/browser';

type Props = {
    renderError: $TSFixMeFunction;
};

type State = $TSFixMe;

class ErrorBoundary extends Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  componentDidCatch(error: $TSFixMe, errorInfo: $TSFixMe) {
    this.setState({ error });
    Sentry.withScope(scope => {
      Object.keys(errorInfo).forEach(key => {
        scope.setExtra(key, errorInfo[key]);
      });
      Sentry.captureException(error);
    });
  }

  render() {
    const { children, renderError } = this.props;
    const { error } = this.state;
    if (error) {
      return renderError(error);
    }
    return children;
  }
}

export default ErrorBoundary;
