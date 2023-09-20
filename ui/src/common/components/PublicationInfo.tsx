import React from 'react';
import { Map } from 'immutable';

import { getPageDisplay } from '../../literature/utils';
import JournalInfo from './JournalInfo';

const PublicationInfo = ({ info }: { info: Map<string, any> }) => {
  function getPageOrArtidDisplay() {
    if (getPageDisplay(info)) {
      return getPageDisplay(info);
    }

    if (info.has('artid')) {
      return info.get('artid');
    }
    return null;
  }

  const material = info.get('material');
  const journalIssue = info.get('journal_issue');
  const pageOrArtidDisplay = getPageOrArtidDisplay();
  if (info.has('journal_title')) {
    return (
      <span>
        <JournalInfo info={info} />
        {pageOrArtidDisplay && journalIssue && <span>,</span>}
        {pageOrArtidDisplay && <span> {pageOrArtidDisplay}</span>}
        {material && material !== 'publication' && <span> ({material})</span>}
      </span>
    );
  }

  if (info.has('pubinfo_freetext')) {
    return <span>{info.get('pubinfo_freetext')}</span>;
  }

  return null;
};

export default PublicationInfo;
