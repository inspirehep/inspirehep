import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList, { SEPARATOR_MIDDLEDOT } from '../InlineList';

import './PublicNotesList.scss';

const LINK_REGEX = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g;

class PublicNotesList extends Component {
  static getValue(note: any) {
    return note.get('value');
  }

  static renderString(note: any) {
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
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'publicNotes' does not exist on type 'Rea... Remove this comment to see the full error message
    const { publicNotes } = this.props;
    return (
      <InlineList
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        label="Note"
        items={publicNotes}
        extractKey={(note: any) => PublicNotesList.getValue(note)}
        renderItem={(note: any) => <span>{PublicNotesList.renderString(note)}</span>}
        separator={SEPARATOR_MIDDLEDOT}
      />
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
PublicNotesList.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  publicNotes: PropTypes.instanceOf(List),
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
PublicNotesList.defaultProps = {
  publicNotes: null,
};

export default PublicNotesList;
