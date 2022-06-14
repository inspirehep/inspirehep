import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SecondaryButton from './SecondaryButton';

class ExpandListToggle extends Component {
  render() {
    const { size, limit, onToggle, expanded, expandLabel } = this.props;

    if (size <= limit) {
      return null;
    }

    const buttonText = expanded ? 'Hide' : `${expandLabel} (${size})`;
    return <SecondaryButton onClick={onToggle}>{buttonText}</SecondaryButton>;
  }
}

ExpandListToggle.propTypes = {
  size: PropTypes.number.isRequired,
  limit: PropTypes.number.isRequired,
  onToggle: PropTypes.func.isRequired,
  expanded: PropTypes.bool.isRequired,
  expandLabel: PropTypes.string,
};

ExpandListToggle.defaultProps = {
  expandLabel: 'Show all',
};

export default ExpandListToggle;
