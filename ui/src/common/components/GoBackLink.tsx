import React, { Component } from 'react';
import PropTypes from 'prop-types';

import LinkLikeButton from './LinkLikeButton';

class GoBackLink extends Component {
  render() {
    const { children, onClick } = this.props;
    return <LinkLikeButton onClick={onClick}>{children}</LinkLikeButton>;
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
