import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList, { SEPARATOR_MIDDLEDOT } from './InlineList';

class PublicNotesList extends Component {
  static getValue(note) {
    return note.get('value');
  }

  render() {
    const { publicNotes } = this.props;
    return (
      <InlineList
        label="Note"
        items={publicNotes}
        extractKey={note => PublicNotesList.getValue(note)}
        renderItem={note => <span>{PublicNotesList.getValue(note)}</span>}
        separator={SEPARATOR_MIDDLEDOT}
      />
    );
  }
}

PublicNotesList.propTypes = {
  publicNotes: PropTypes.instanceOf(List),
};

PublicNotesList.defaultProps = {
  publicNotes: null,
};

export default PublicNotesList;
