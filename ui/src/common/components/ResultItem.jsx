import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ContentBox from './ContentBox';

class ResultItem extends Component {
  render() {
    const { leftActions, rightActions, children } = this.props;
    return (
      <ContentBox leftActions={leftActions} rightActions={rightActions}>
        {children}
      </ContentBox>
    );
  }
}

ResultItem.propTypes = {
  leftActions: PropTypes.node,
  rightActions: PropTypes.node,
  children: PropTypes.node,
};

ResultItem.defaultProps = {
  leftActions: undefined,
  rightActions: undefined,
  children: undefined,
};

export default ResultItem;
