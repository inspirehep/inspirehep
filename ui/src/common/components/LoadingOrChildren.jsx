import React, { Component } from 'react';

import Loading from './Loading';

class LoadingOrChildren extends Component {
  render() {
    const { children, loading } = this.props;
    return loading ? <Loading /> : <>{children}</>;
  }
}

export default LoadingOrChildren;
