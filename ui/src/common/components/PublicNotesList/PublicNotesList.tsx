import React, { Component } from 'react';
import { List } from 'immutable';

import InlineList, { SEPARATOR_MIDDLEDOT } from '../InlineList';

import './PublicNotesList.scss';

const LINK_REGEX = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g;

type OwnProps = {
    publicNotes?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
};

type Props = OwnProps & typeof PublicNotesList.defaultProps;

class PublicNotesList extends Component<Props> {

static defaultProps = {
    publicNotes: null,
};

  static getValue(note: $TSFixMe) {
    return note.get('value');
  }

  static renderString(note: $TSFixMe) {
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
        extractKey={(note: $TSFixMe) => PublicNotesList.getValue(note)}
        renderItem={(note: $TSFixMe) => <span>{PublicNotesList.renderString(note)}</span>}
        separator={SEPARATOR_MIDDLEDOT}
      />
    );
  }
}

export default PublicNotesList;
