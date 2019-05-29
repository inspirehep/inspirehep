import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SanitizedHTML from 'react-sanitized-html';

class Description extends Component {
  render() {
    const { description } = this.props;
    return (
      <div>
        <div>
          <strong>Job description:</strong>
        </div>
        <SanitizedHTML
          allowedAttributes={{ a: ['href', 'title'] }}
          allowedTags={[
            'a',
            'b',
            'br',
            'em',
            'i',
            'li',
            'ol',
            'p',
            'strong',
            'ul',
          ]}
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
