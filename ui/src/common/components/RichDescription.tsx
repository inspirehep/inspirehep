import React, { Component } from 'react';
import PropTypes from 'prop-types';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import SanitizedHTML from 'react-sanitized-html';

const ALLOWED_ATTRIBUTES_BY_TAG = { a: ['href', 'title'] };
const ALLOWED_HTML_TAGS = [
  'a',
  'b',
  'br',
  'div',
  'em',
  'i',
  'li',
  'ol',
  'p',
  'strong',
  'ul',
];

class RichDescription extends Component {
  render() {
    const { children } = this.props;
    return (
      <SanitizedHTML
        allowedAttributes={ALLOWED_ATTRIBUTES_BY_TAG}
        allowedTags={ALLOWED_HTML_TAGS}
        html={children}
      />
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
RichDescription.propTypes = {
  children: PropTypes.node,
};

export default RichDescription;
