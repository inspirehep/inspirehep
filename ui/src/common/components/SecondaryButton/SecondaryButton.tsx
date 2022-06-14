import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './SecondaryButton.scss';

class SecondaryButton extends Component {
  render() {
    const { onClick, children } = this.props;
    return (
      <button type="button" className="__SecondaryButton__" onClick={onClick}>
        {children}
      </button>
    );
  }
}

SecondaryButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default SecondaryButton;
