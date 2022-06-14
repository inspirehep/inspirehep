import React, { Component } from 'react';
import PropTypes from 'prop-types';

class LinkLikeButton extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'onClick' does not exist on type 'Readonl... Remove this comment to see the full error message
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

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
LinkLikeButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  dataTestId: PropTypes.string,
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
LinkLikeButton.defaultProps = {
  dataTestId: undefined,
};

export default LinkLikeButton;
