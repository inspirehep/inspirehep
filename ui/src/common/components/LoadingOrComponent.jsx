import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Loading from './Loading';

class LoadingOrComponent extends Component {
  render() {
    if (this.props.loading) {
      return <Loading />;
    }
    return this.props.children;
  }
}

LoadingOrComponent.propTypes = {
  loading: PropTypes.bool,
  children: PropTypes.node,
};

LoadingOrComponent.defaultProps = {
  loading: undefined,
  children: undefined,
};

export default LoadingOrComponent;
