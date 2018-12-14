import React, { Component } from 'react';
import PropTypes from 'prop-types';

class LinkLikeButton extends Component {
  render() {
    const { children, onClick } = this.props;
    return (
      /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/anchor-is-valid */
      <a onClick={onClick}>{children}</a>
    );
  }
}

LinkLikeButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.string.isRequired,
};

export default LinkLikeButton;
