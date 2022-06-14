import React, { Component } from 'react';

type Props = {
    journal: {
        [key: string]: $TSFixMe;
    };
};

class JournalSuggestion extends Component<Props> {

  render() {
    const { journal } = this.props;
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
}

export default JournalSuggestion;
