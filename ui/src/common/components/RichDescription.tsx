import React, { Component } from 'react';
import PropTypes from 'prop-types';
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

RichDescription.propTypes = {
  children: PropTypes.node,
};

export default RichDescription;
