import React from 'react';
import { Map } from 'immutable';

type Props = {
    info: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
};

function JournalInfo({ info }: Props) {
  const journalTitle = info.get('journal_title');
  const journalIssue = info.get('journal_issue');
  const journalVolume = info.get('journal_volume');
  const year = info.get('year');
  return (
    <span>
      <i>{journalTitle}</i>
      {journalVolume && <span> {journalVolume}</span>}
      {year && <span> ({year})</span>}
      {journalIssue && <span> {journalIssue}</span>}
    </span>
  );
}

export default JournalInfo;
