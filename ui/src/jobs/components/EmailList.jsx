import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import ExternalLink from '../../common/components/ExternalLink';
import InlineList from '../../common/components/InlineList';

class EmailList extends Component {
  static renderEmail(email) {
    return <ExternalLink href={`mailto:${email}`}>{email}</ExternalLink>;
  }

  render() {
    const { emails } = this.props;

    return <InlineList items={emails} renderItem={EmailList.renderEmail} />;
  }
}

EmailList.propTypes = {
  emails: PropTypes.instanceOf(List),
};

EmailList.defaultProps = {
  emails: null,
};

export default EmailList;
