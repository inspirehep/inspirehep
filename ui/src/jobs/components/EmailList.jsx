import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import LinkWithTargetBlank from '../../common/components/LinkWithTargetBlank';
import InlineDataList from '../../common/components/InlineList';

class EmailList extends Component {
  static renderEmail(email) {
    return (
      <LinkWithTargetBlank href={`mailto:${email}`}>
        {email}
      </LinkWithTargetBlank>
    );
  }

  render() {
    const { emails } = this.props;

    return <InlineDataList items={emails} renderItem={EmailList.renderEmail} />;
  }
}

EmailList.propTypes = {
  emails: PropTypes.instanceOf(List),
};

EmailList.defaultProps = {
  emails: null,
};

export default EmailList;
