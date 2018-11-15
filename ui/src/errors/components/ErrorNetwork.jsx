import React, { Component } from 'react';

import error500Image from '../images/500.svg';
import ErrorPage from './ErrorPage';

class ErrorNetwork extends Component {
  render() {
    return <ErrorPage message="Connection error!" imageSrc={error500Image} />;
  }
}

export default ErrorNetwork;
