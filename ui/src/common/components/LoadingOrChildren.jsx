import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Loading from './Loading';

class LoadingOrChildren extends Component {
  render() {
    if (this.props.loading) {
      return <Loading />;
    }
    return this.props.children;
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
