import React from 'react';

function JournalSuggestion({ journal }: { journal: any }) {
  const shortTitle = journal.short_title;
  const journalTitle = journal.journal_title && journal.journal_title.title;
  return (
    <>
      <div>
        <strong>{shortTitle}</strong>
      </div>
      <div className="f7">
        <span>{journalTitle}</span>
      </div>
    </>
  );
}

export default JournalSuggestion;
