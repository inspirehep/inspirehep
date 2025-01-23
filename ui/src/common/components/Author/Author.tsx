import React from 'react';
import { Map } from 'immutable';
import { Tooltip } from 'antd';

import AffiliationList from '../AffiliationList';
import UnlinkedAuthor from './UnlinkedAuthor';
import AuthorWithBAI from './AuthorWithBAI';
import LinkedAuthor from './LinkedAuthor';
import EventTracker from '../EventTracker';

const Author = ({
  author,
  page,
  unlinked,
}: {
  author: Map<string, string>;
  page: string;
  unlinked?: boolean;
}) => {
  function renderRoleSuffix() {
    const roles = author.get('inspire_roles', []) as unknown as string[];

    if (roles.indexOf('editor') > -1) {
      return <Tooltip title="editor">(ed.)</Tooltip>;
    }

    return null;
  }

  function renderAffiliationsList() {
    const affiliations = author.get('affiliations');
    return (
      affiliations && (
        <span className="pl1 secondary-color">
          (
          <AffiliationList affiliations={affiliations} unlinked={unlinked} />)
        </span>
      )
    );
  }

  function renderAuthorName() {
    if (author.has('record') && !unlinked) {
      return <LinkedAuthor author={author} />;
    }
    if (author.has('bai') && !unlinked) {
      return <AuthorWithBAI author={author} />;
    }
    return <UnlinkedAuthor author={author} />;
  }

  return (
    <div className="di">
      {renderAuthorName()}
      <EventTracker
        eventCategory={page}
        eventAction="Link"
        eventId="Author profile"
        eventPropName="onClick"
      >
        <>{renderAffiliationsList()}</>
      </EventTracker>
      {renderRoleSuffix()}
    </div>
  );
};

export default Author;
