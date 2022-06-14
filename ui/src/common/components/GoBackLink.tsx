import React, { Component } from 'react';
import PropTypes from 'prop-types';

import LinkLikeButton from './LinkLikeButton';

class GoBackLink extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'onClick' does not exist on type 'Readonl... Remove this comment to see the full error message
    const { children, onClick } = this.props;
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    return <LinkLikeButton onClick={onClick}>{children}</LinkLikeButton>;
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
GoBackLink.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.string,
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
GoBackLink.defaultProps = {
  children: 'go back',
};

export default GoBackLink;
