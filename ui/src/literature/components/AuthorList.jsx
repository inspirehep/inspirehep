import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList from '../../common/components/InlineList';


class AuthorList extends Component {
  render() {
    const { authors, limit, recordId } = this.props;
    return (
      <div>
        <InlineList
          items={authors.take(limit)}
          suffix={(authors.size > limit ? <span> et al.</span> : null)}
          renderItem={author => (
            <a target="_blank" href={`//inspirehep.net/author/profile/${author.get('full_name')}?recid=${recordId}`}>
              {author.get('full_name')}
            </a>
          )}
        />
      </div>
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
