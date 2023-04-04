import React from 'react';
import { List, Map } from 'immutable';

import InlineDataList, { SEPARATOR_MIDDLEDOT } from '../InlineList';

import './PublicNotesList.less';

const LINK_REGEX =
  /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g;

function PublicNotesList({ publicNotes }: { publicNotes: List<any> }) {
  function getValue(note: Map<string, any>) {
    return note.get('value');
  }

  function renderString(note: Map<string, any>) {
    const parts = getValue(note).split(LINK_REGEX);
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

  return (
    <InlineDataList
      label="Note"
      items={publicNotes}
      extractKey={(note: Map<string, any>) => getValue(note)}
      renderItem={(note: Map<string, any>) => <span>{renderString(note)}</span>}
      separator={SEPARATOR_MIDDLEDOT}
    />
  );
}

PublicNotesList.defaultProps = {
  publicNotes: null,
};

export default PublicNotesList;
