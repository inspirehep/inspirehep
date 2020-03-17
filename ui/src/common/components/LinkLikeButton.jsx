import React, { Component } from 'react';
import PropTypes from 'prop-types';

class LinkLikeButton extends Component {
  render() {
    const { children, onClick, dataTestId } = this.props;
    return (
      // TODO: use `<antd.Button type="link"` (as of now it has a problem with the style after button is clicked)
      /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/anchor-is-valid */
      <a data-test-id={dataTestId} onClick={onClick}>
        {children}
      </a>
    );
  }
}

LinkLikeButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  dataTestId: PropTypes.string,
};

LinkLikeButton.defaultProps = {
  dataTestId: undefined,
};

export default LinkLikeButton;
