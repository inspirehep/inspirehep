import React, { Component } from 'react';
import { Row } from 'antd';

import error500Image from '../images/500.svg';
import ErrorPage from './ErrorPage';

class ErrorAppCrash extends Component {
  render() {
    return (
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <Row type="flex" justify="center">
        <ErrorPage
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          message="Something went wrong"
          detail={
            <span>
              Please try again later, you can <a href="/">go back home</a> now.
            </span>
          }
          imageSrc={error500Image}
        />
      </Row>
    );
  }
}

export default ErrorAppCrash;
