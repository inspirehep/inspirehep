import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import AuthorList from './AuthorList';
import CollaborationList from './CollaborationList';

class AuthorsAndCollaborations extends Component {
  renderBulletIfAuthorsNotEmpty() {
    const { authors } = this.props;
    return authors.size > 0 && <span className="mh1">&bull;</span>;
  }

  renderAuthorList(wrapperClassName, limit) {
    const { authors, authorCount, enableAuthorsShowAll } = this.props;
    return (
      <AuthorList
        wrapperClassName={wrapperClassName}
        limit={limit}
        total={authorCount}
        authors={authors}
        enableShowAll={enableAuthorsShowAll}
      />
    );
  }

  renderCollaborationList() {
    const { collaborations, collaborationsWithSuffix } = this.props;
    return (
      <CollaborationList
        collaborations={collaborations}
        collaborationsWithSuffix={collaborationsWithSuffix}
      />
    );
  }

  render() {
    const { authors, collaborations, collaborationsWithSuffix } = this.props;
    const collaborationsSize =
      collaborations.size + collaborationsWithSuffix.size;

    if (collaborationsSize === 0) {
      return this.renderAuthorList('di');
    }

    if (authors.size === 1) {
      return (
        <>
          {this.renderCollaborationList()}
          {this.renderBulletIfAuthorsNotEmpty()}
          {this.renderAuthorList('di')}
          <span> for the collaboration</span>
          {collaborationsSize > 1 && <span>s</span>}
          <span>.</span>
        </>
      );
    }

    return (
      <>
        {this.renderCollaborationList()}
        {this.renderBulletIfAuthorsNotEmpty()}
        {this.renderAuthorList('di', 1)}
      </>
    );
  }
}

AuthorsAndCollaborations.propTypes = {
  authors: PropTypes.instanceOf(List),
  authorCount: PropTypes.number,
  enableAuthorsShowAll: PropTypes.bool,
  collaborations: PropTypes.instanceOf(List),
  collaborationsWithSuffix: PropTypes.instanceOf(List),
};

AuthorsAndCollaborations.defaultProps = {
  authorCount: undefined,
  authors: List(),
  collaborations: List(),
  collaborationsWithSuffix: List(),
  enableAuthorsShowAll: false,
};

export default AuthorsAndCollaborations;
