import React, { Component, Fragment } from 'react';
import { List } from 'immutable';

import AuthorList from './AuthorList';
import CollaborationList from './CollaborationList';

type OwnProps = {
    authors?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
    authorCount?: number;
    enableAuthorsShowAll?: boolean;
    collaborations?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
    collaborationsWithSuffix?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
};

type Props = OwnProps & typeof AuthorsAndCollaborations.defaultProps;

class AuthorsAndCollaborations extends Component<Props> {

static defaultProps: $TSFixMe;

  renderBulletIfAuthorsNotEmpty() {
    const { authors } = this.props;
    return authors.size > 0 && <span className="mh1">&bull;</span>;
  }

  renderAuthorList(wrapperClassName: $TSFixMe, limit: $TSFixMe) {
    const { authors, authorCount, enableAuthorsShowAll } = this.props;
    return (
      <Fragment>
        <AuthorList
          // @ts-expect-error ts-migrate(2322) FIXME: Type 'any' is not assignable to type 'never'.
          wrapperClassName={wrapperClassName}
          // @ts-expect-error ts-migrate(2322) FIXME: Type 'any' is not assignable to type 'never'.
          limit={limit}
          // @ts-expect-error ts-migrate(2322) FIXME: Type 'any' is not assignable to type 'never'.
          total={authorCount}
          // @ts-expect-error ts-migrate(2322) FIXME: Type 'any' is not assignable to type 'never'.
          authors={authors}
          // @ts-expect-error ts-migrate(2322) FIXME: Type 'any' is not assignable to type 'never'.
          enableShowAll={enableAuthorsShowAll}
        />
      </Fragment>
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
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
      return this.renderAuthorList('di');
    }

    if (authors.size === 1) {
      return (
        <Fragment>
          {this.renderCollaborationList()}
          {this.renderBulletIfAuthorsNotEmpty()}
          {/* @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1. */}
          {this.renderAuthorList('di')}
          <span> for the collaboration</span>
          {collaborationsSize > 1 && <span>s</span>}
          <span>.</span>
        </Fragment>
      );
    }

    return (
      <Fragment>
        {this.renderCollaborationList()}
        {this.renderBulletIfAuthorsNotEmpty()}
        {this.renderAuthorList('di', 1)}
      </Fragment>
    );
  }
}

AuthorsAndCollaborations.defaultProps = {
  authorCount: undefined,
  authors: List(),
  collaborations: List(),
  collaborationsWithSuffix: List(),
  enableAuthorsShowAll: false,
};

export default AuthorsAndCollaborations;
