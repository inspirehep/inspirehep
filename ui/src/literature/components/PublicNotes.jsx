import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList, {
  SEPARATOR_MIDDLEDOT,
} from '../../common/components/InlineList';

const LINK_REGEX = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g;

class PublicNotes extends Component {
  static getValue(note) {
    return note.get('value');
  }

  static renderString(note) {
    const parts = PublicNotes.getValue(note).split(LINK_REGEX);
    for (let i = 0; i < parts.length; i += 1) {
      if (LINK_REGEX.test(parts[i])) {
        parts[i] = (
          <a key={`link ${i}`} href={parts[i]}>
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
        label="Notes"
        items={publicNotes}
        extractKey={(note) => PublicNotes.getValue(note)}
        renderItem={(note) => <span>{PublicNotes.renderString(note)}</span>}
        separator={SEPARATOR_MIDDLEDOT}
      />
    );
  }
}

PublicNotes.propTypes = {
  publicNotes: PropTypes.instanceOf(List),
};

PublicNotes.defaultProps = {
  publicNotes: null,
};

export default PublicNotes;
