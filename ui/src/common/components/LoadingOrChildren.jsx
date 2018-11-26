import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Loading from './Loading';

class LoadingOrChildren extends Component {
  render() {
    const { children, loading } = this.props;
    return loading ? <Loading /> : children;
  }
}

LoadingOrChildren.propTypes = {
  loading: PropTypes.bool,
  children: PropTypes.node,
};

LoadingOrChildren.defaultProps = {
  loading: undefined,
  children: undefined,
};

export default LoadingOrChildren;
