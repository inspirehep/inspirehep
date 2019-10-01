import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import InlineUL from '../../common/components/InlineList/InlineUL';
import URLList from '../../common/components/URLList';
import EmailList from './EmailList';

class ReferenceLettersContacts extends Component {
  render() {
    const { referenceLetters } = this.props;
    const urls = referenceLetters.get('urls');
    const emails = referenceLetters.get('emails');
    const shouldRender = Boolean(urls || emails);
    return (
      shouldRender && (
        <div>
          <strong>Letters of Reference should be sent to: </strong>
          <InlineUL wrapperClassName="di">
            {emails && <EmailList emails={emails} />}
            {urls && <URLList urls={urls} />}
          </InlineUL>
        </div>
      )
    );
  }
}

ReferenceLettersContacts.propTypes = {
  referenceLetters: PropTypes.instanceOf(Map),
};
ReferenceLettersContacts.defaultProps = {
  referenceLetters: Map(),
};
export default ReferenceLettersContacts;
