import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import URLList from '../../common/components/URLList';
import EmailList from './EmailList';
import { InlineUL } from '../../common/components/InlineList';

class ReferenceLettersContacts extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'referenceLetters' does not exist on type... Remove this comment to see the full error message
    const { referenceLetters } = this.props;
    const urls = referenceLetters.get('urls');
    const emails = referenceLetters.get('emails');
    const shouldRender = Boolean(urls || emails);
    return (
      shouldRender && (
        <div>
          <strong>Letters of Reference should be sent to: </strong>
          {/* @ts-ignore */}
          <InlineUL wrapperClassName="di">
            {/* @ts-ignore */}
            {emails && <EmailList emails={emails} />}
            {/* @ts-ignore */}
            {urls && <URLList urls={urls} />}
          </InlineUL>
        </div>
      )
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ReferenceLettersContacts.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  referenceLetters: PropTypes.instanceOf(Map),
};
// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
ReferenceLettersContacts.defaultProps = {
  referenceLetters: Map(),
};
export default ReferenceLettersContacts;
