import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Loading from './Loading';

class LoadingOrChildren extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'loading' does not exist on type 'Readonl... Remove this comment to see the full error message
    const { children, loading } = this.props;
    return loading ? <Loading /> : children;
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
LoadingOrChildren.propTypes = {
  loading: PropTypes.bool,
  children: PropTypes.node,
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
LoadingOrChildren.defaultProps = {
  loading: undefined,
  children: undefined,
};

export default LoadingOrChildren;
