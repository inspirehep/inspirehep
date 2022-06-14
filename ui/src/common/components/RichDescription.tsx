import React, { Component } from 'react';
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

type Props = {};

class RichDescription extends Component<Props> {

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

export default RichDescription;
