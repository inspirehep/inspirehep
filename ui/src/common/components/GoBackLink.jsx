import React, { Component } from 'react';
import PropTypes from 'prop-types';

import LinkLikeButton from './LinkLikeButton/LinkLikeButton';

class GoBackLink extends Component {
  render() {
    const { children, onClick } = this.props;
    return <LinkLikeButton color='blue big' onClick={onClick}>{children}</LinkLikeButton>;
  }
}

GoBackLink.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.string,
};

GoBackLink.defaultProps = {
  children: 'go back',
};

export default GoBackLink;
