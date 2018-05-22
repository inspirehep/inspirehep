import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList from '../../common/components/InlineList';
import AuthorLink from './AuthorLink';

class AuthorList extends Component {
  render() {
    const { authors, limit, recordId } = this.props;
    return (
      <InlineList
        items={authors.take(limit)}
        suffix={(authors.size > limit ? <span> et al.</span> : null)}
        renderItem={author => (
          <AuthorLink fullName={author.get('full_name')} recordId={recordId} />
        )}
      />
    );
  }
}

AuthorList.propTypes = {
  authors: PropTypes.instanceOf(List),
  recordId: PropTypes.number.isRequired,
  limit: PropTypes.number,
};

AuthorList.defaultProps = {
  authors: List(),
  limit: 3,
};

export default AuthorList;
