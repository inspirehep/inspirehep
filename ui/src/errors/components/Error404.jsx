import React, { Component } from 'react';
import error404Image from '../images/404.svg';
import ErrorPage from './ErrorPage';

class Error404 extends Component {
  render() {
    const previousURL = document.referrer;
    return (
      <ErrorPage
        message="Sorry, we were not able to find what you were looking for..."
        imageSrc={error404Image}
        url={previousURL}
      />
    );
  }
}

export default Error404;
