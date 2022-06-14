import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';

function JournalInfo({
  info
}: any) {
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

JournalInfo.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  info: PropTypes.instanceOf(Map).isRequired,
};

export default JournalInfo;
