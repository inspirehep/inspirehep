import React, { Component } from 'react';
import error404Image from '../images/404.svg';
import ErrorPage from './ErrorPage';

class Error404 extends Component {
  render() {
    return (
      <ErrorPage
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        message="Sorry, we were not able to find what you were looking for..."
        imageSrc={error404Image}
      />
    );
  }
}

export default Error404;
