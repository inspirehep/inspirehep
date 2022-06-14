import React, { Component } from 'react';

import Loading from './Loading';

type OwnProps = {
    loading?: boolean;
};

type Props = OwnProps & typeof LoadingOrChildren.defaultProps;

class LoadingOrChildren extends Component<Props> {

static defaultProps: $TSFixMe;

  render() {
    const { children, loading } = this.props;
    return loading ? <Loading /> : children;
  }
}

LoadingOrChildren.defaultProps = {
  loading: undefined,
  children: undefined,
};

export default LoadingOrChildren;
