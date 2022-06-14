import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SecondaryButton from './SecondaryButton';

class ExpandListToggle extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'size' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    const { size, limit, onToggle, expanded, expandLabel } = this.props;

    if (size <= limit) {
      return null;
    }

    const buttonText = expanded ? 'Hide' : `${expandLabel} (${size})`;
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    return <SecondaryButton onClick={onToggle}>{buttonText}</SecondaryButton>;
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ExpandListToggle.propTypes = {
  size: PropTypes.number.isRequired,
  limit: PropTypes.number.isRequired,
  onToggle: PropTypes.func.isRequired,
  expanded: PropTypes.bool.isRequired,
  expandLabel: PropTypes.string,
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
ExpandListToggle.defaultProps = {
  expandLabel: 'Show all',
};

export default ExpandListToggle;
