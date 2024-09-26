import React, { Component } from 'react';
import PropTypes from 'prop-types';

class JournalSuggestion extends Component {
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

JournalSuggestion.propTypes = {
  journal: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default JournalSuggestion;
