import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ContentBox from './ContentBox';

class ResultItem extends Component {
  render() {
    const { actions, children } = this.props;
    return <ContentBox actions={actions}>{children}</ContentBox>;
  }
}

ResultItem.propTypes = {
  actions: PropTypes.node,
  children: PropTypes.node,
};

ResultItem.defaultProps = {
  actions: undefined,
  children: undefined,
};

export default ResultItem;
