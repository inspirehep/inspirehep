import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import ExternalLink from '../../common/components/ExternalLink';
import InlineList from '../../common/components/InlineList';

class EmailList extends Component {
  static renderEmail(email: any) {
    return <ExternalLink href={`mailto:${email}`}>{email}</ExternalLink>;
  }

  render() {
    {/* @ts-ignore */}
    const { emails } = this.props;
    /* @ts-ignore */
    return <InlineList items={emails} renderItem={EmailList.renderEmail} />;
  }
}
{/* @ts-ignore */}
EmailList.propTypes = {
  /* @ts-ignore */
  emails: PropTypes.instanceOf(List),
};
{/* @ts-ignore */}
EmailList.defaultProps = {
  emails: null,
};

export default EmailList;
