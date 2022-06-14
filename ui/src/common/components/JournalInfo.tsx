import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';

function JournalInfo({ info }) {
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
  info: PropTypes.instanceOf(Map).isRequired,
};

export default JournalInfo;
