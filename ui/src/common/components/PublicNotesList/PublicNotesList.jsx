import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList, { SEPARATOR_MIDDLEDOT } from '../InlineList';

import './PublicNotesList.scss';

const LINK_REGEX = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g;

class PublicNotesList extends Component {
  static getValue(note) {
    return note.get('value');
  }

  static renderString(note) {
    const parts = PublicNotesList.getValue(note).split(LINK_REGEX);
    for (let i = 0; i < parts.length; i += 1) {
      if (LINK_REGEX.test(parts[i])) {
        parts[i] = (
          <a
            key={`publication-note-link-${i}`}
            href={parts[i]}
            className="__PublicNotesList__"
          >
            {parts[i]}
          </a>
        );
      }
    }
    return parts;
  }

  render() {
    const { publicNotes } = this.props;
    return (
      <InlineList
        label="Note"
        items={publicNotes}
        extractKey={(note) => PublicNotesList.getValue(note)}
        renderItem={(note) => <span>{PublicNotesList.renderString(note)}</span>}
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
