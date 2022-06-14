import React, { Component } from 'react';
import { Map } from 'immutable';
import URLList from '../../common/components/URLList';
import EmailList from './EmailList';
import { InlineUL } from '../../common/components/InlineList';

type OwnProps = {
    referenceLetters?: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
};

type Props = OwnProps & typeof ReferenceLettersContacts.defaultProps;

class ReferenceLettersContacts extends Component<Props> {

static defaultProps = {
    referenceLetters: Map(),
};

  render() {
    const { referenceLetters } = this.props;
    const urls = referenceLetters.get('urls');
    const emails = referenceLetters.get('emails');
    const shouldRender = Boolean(urls || emails);
    return (
      shouldRender && (
        <div>
          <strong>Letters of Reference should be sent to: </strong>
          {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
          <InlineUL wrapperClassName="di">
            {emails && <EmailList emails={emails} />}
            {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
            {urls && <URLList urls={urls} />}
          </InlineUL>
        </div>
      )
    );
  }
}
export default ReferenceLettersContacts;
