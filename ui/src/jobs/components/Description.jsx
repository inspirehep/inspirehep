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

class Description extends Component {
  render() {
    const { description } = this.props;
    return (
      <div>
        <div>
          <strong>Job description:</strong>
        </div>
        <SanitizedHTML
          allowedAttributes={ALLOWED_ATTRIBUTES_BY_TAG}
          allowedTags={ALLOWED_HTML_TAGS}
          html={description}
        />
      </div>
    );
  }
}

Description.propTypes = {
  description: PropTypes.string.isRequired,
};

export default Description;
