import React from 'react';
import { List } from 'immutable';

import AuthorList from './AuthorList';
import CollaborationList from './CollaborationList';

const AuthorsAndCollaborations = ({
  authors,
  authorCount,
  enableAuthorsShowAll,
  page,
  collaborationsWithSuffix,
  collaborations,
}: {
  authors: List<any>;
  authorCount: number;
  enableAuthorsShowAll: boolean;
  page: string;
  collaborationsWithSuffix: List<any>;
  collaborations: List<any>;
}) => {
  function renderBulletIfAuthorsNotEmpty() {
    return authors.size > 0 && <span className="mh1">&bull;</span>;
  }

  function renderAuthorList(wrapperClassName: string, limit: number = 5) {
    return (
      <>
        <AuthorList
          wrapperClassName={wrapperClassName}
          limit={limit}
          total={authorCount}
          authors={authors}
          enableShowAll={enableAuthorsShowAll}
          page={page}
        />
      </>
    );
  }

  function renderCollaborationList() {
    return (
      <CollaborationList
        collaborations={collaborations}
        collaborationsWithSuffix={collaborationsWithSuffix}
      />
    );
  }

  const collaborationsSize =
    collaborations.size + collaborationsWithSuffix.size;

  if (collaborationsSize === 0) {
    return renderAuthorList('di');
  }

  if (authors.size === 1) {
    return (
      <>
        {renderCollaborationList()}
        {renderBulletIfAuthorsNotEmpty()}
        {renderAuthorList('di')}
        <span> for the collaboration</span>
        {collaborationsSize > 1 && <span>s</span>}
        <span>.</span>
      </>
    );
  }

  return (
    <>
      {renderCollaborationList()}
      {renderBulletIfAuthorsNotEmpty()}
      {renderAuthorList('di', 1)}
    </>
  );
};

AuthorsAndCollaborations.defaultProps = {
  authorCount: undefined,
  authors: List(),
  collaborations: List(),
  collaborationsWithSuffix: List(),
  enableAuthorsShowAll: false,
};

export default AuthorsAndCollaborations;
