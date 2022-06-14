import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './SecondaryButton.scss';

class SecondaryButton extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'onClick' does not exist on type 'Readonl... Remove this comment to see the full error message
    const { onClick, children } = this.props;
    return (
      <button type="button" className="__SecondaryButton__" onClick={onClick}>
        {children}
      </button>
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
SecondaryButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default SecondaryButton;
