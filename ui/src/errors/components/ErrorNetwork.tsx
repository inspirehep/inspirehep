import React, { Component } from 'react';

import error500Image from '../images/500.svg';
import ErrorPage from './ErrorPage';
import GoBackLinkContainer from '../../common/containers/GoBackLinkContainer';

class ErrorNetwork extends Component {
  render() {
    return (
      <ErrorPage
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        message="Connection error!"
        imageSrc={error500Image}
        detail={
          <span>
            Please check your internet connection and{' '}
            <GoBackLinkContainer>try again</GoBackLinkContainer>
          </span>
        }
      />
    );
  }
}

export default ErrorNetwork;
