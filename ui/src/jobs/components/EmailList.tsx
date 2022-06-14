import React, { Component } from 'react';
import { List } from 'immutable';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from '../../common/components/ExternalLink.tsx';
import InlineList from '../../common/components/InlineList';

type OwnProps = {
    emails?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
};

type Props = OwnProps & typeof EmailList.defaultProps;

class EmailList extends Component<Props> {

static defaultProps = {
    emails: null,
};

  static renderEmail(email: $TSFixMe) {
    return <ExternalLink href={`mailto:${email}`}>{email}</ExternalLink>;
  }

  render() {
    const { emails } = this.props;

    return <InlineList items={emails} renderItem={EmailList.renderEmail} />;
  }
}

export default EmailList;
