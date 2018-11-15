import React, { Component } from 'react';
import error401Image from '../images/401.svg';
import ErrorPage from './ErrorPage';

class Error401 extends Component {
  render() {
    return (
      <ErrorPage
        message="Sorry, you are not authorised to view this page."
        imageSrc={error401Image}
      />
    );
  }
}

export default Error401;
