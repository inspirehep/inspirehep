import React, { Component } from 'react';

import error500Image from '../images/500.svg';
import ErrorPage from './ErrorPage';
import GoBackLinkContainer from '../../common/containers/GoBackLinkContainer';

class Error500 extends Component {
  render() {
    return (
      <ErrorPage
        message="Something went wrong"
        detail={
          <span>
            Please try again later or <GoBackLinkContainer />
          </span>
        }
        imageSrc={error500Image}
      />
    );
  }
}

export default Error500;
